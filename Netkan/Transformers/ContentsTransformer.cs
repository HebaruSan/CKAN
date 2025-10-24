using System.IO;
using System.Collections.Generic;
using System.Linq;

using SharpCompress.Archives;

using CKAN.IO;
using CKAN.Games;
using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;
using CKAN.NetKAN.Sources.Github;
using CKAN.NetKAN.Extensions;

namespace CKAN.NetKAN.Transformers
{
    internal sealed class ContentsTransformer : ITransformer
    {
        public ContentsTransformer(IHttpService http,
                                   IGithubApi   ghApi,
                                   IGame        game)
        {
            this.http  = http;
            this.ghApi = ghApi;
            this.game  = game;
        }

        public string Name => "contents";

        public IEnumerable<Metadata> Transform(Metadata metadata, TransformOptions opts)
        {
            if (http.DownloadModule(metadata) is { Length: > 0 } archivePath)
            {
                // We run before the AVC transformer, which sets "version" for Jenkins.
                // Set it to a default if missing so CkanModule can initialize.
                var moduleJson = metadata.Json();
                moduleJson.SafeAdd("version", "1");
                CkanModule mod = CkanModule.FromJson(moduleJson.ToString());

                // Make a new batch of transformers to prevent state from leaking between files
                var transformers = new IContentTransformer[]
                {
                    new InternalCkanTransformer(),
                    new SpaceWarpInfoTransformer(new SpaceWarpInfoLoader(http, ghApi)),
                    new AvcTransformer(http, ghApi),
                    new LocalizationsTransformer(),
                    new InstallSizeTransformer(),
                };
                // Let all the transformers scan the archive in a single pass
                using (var archive = ArchiveFactory.Open(archivePath))
                {
                    var (files, _) = ModuleInstaller.GetInstallableFiles(mod, archive, game);

                    foreach (var entry in archive.Entries)
                    {
                        // Only get the inner file contents on demand, with caching
                        string? contents = null;
                        foreach (var t in transformers)
                        {
                            t.VisitContainedFile(metadata, mod,
                                                 entry,
                                                 files.Contains(entry.Key ?? ""),
                                                 () => contents ??= ReadToEnd(entry.OpenEntryStream()));
                        }
                    }
                }
                // Now apply the results of the scanning to the metadata
                return Enumerable.Repeat(transformers.Aggregate(
                                             metadata,
                                             (module, tr) => tr.Transform(module)),
                                         1);
            }
            return Enumerable.Repeat(metadata, 1);
        }

        private static string ReadToEnd(Stream s)
        {
            using (s)
            using (var innerReader = new StreamReader(s))
            {
                return innerReader.ReadToEnd();
            }
        }

        private readonly IHttpService http;
        private readonly IGithubApi   ghApi;
        private readonly IGame        game;
    }
}
