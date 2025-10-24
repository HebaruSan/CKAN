using System;
using System.Collections.Generic;
using System.Linq;

using SharpCompress.Common;
using log4net;

using CKAN.IO;
using CKAN.Games;
using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Validators
{
    internal sealed class InstallsFilesValidator : IContentValidator
    {
        public InstallsFilesValidator(IGame game, CkanModule module)
        {
            _game   = game;
            modDirs = Enumerable.Repeat(game.PrimaryModDirectoryRelative, 1)
                                .Concat(game.AlternateModDirectoriesRelative)
                                .ToHashSet();

            unmatchedIncludeOnlys = (module.install
                                           ?? Enumerable.Empty<ModuleInstallDescriptor>())
                                           .SelectMany(stanza => stanza.include_only
                                                                 ?? Enumerable.Empty<string>())
                                           .Distinct()
                                           .ToHashSet();
        }

        public void VisitContainedFile(Metadata                             metadata,
                                       CkanModule                           module,
                                       IEntry                               entry,
                                       IReadOnlyCollection<InstallableFile> installsAs,
                                       Func<string>                         getContents)
        {
            if (installsAs.Count > 0)
            {
                hasInstallable = true;
            }

            var dests = installsAs.Select(f => f.relDest).ToHashSet();

            // GameData within GameData
            gamedatas.UnionWith(
                dests.SelectMany(p => modDirs.Where(dir => p.StartsWith(dir, StringComparison.InvariantCultureIgnoreCase)
                                                           && p.LastIndexOf($"/{dir}/", StringComparison.InvariantCultureIgnoreCase) > 0)
                                             .Select(dir => (p, dir))));

            // Self-overwrites
            overwrites.UnionWith(relDests.Intersect(dests));
            relDests.UnionWith(dests);

            // include_only with no matches
            unmatchedIncludeOnlys.RemoveWhere(includeOnly => installsAs.Any(f => f.relDest.Contains(includeOnly)));
        }

        public void Validate(Metadata metadata, CkanModule module)
        {
            // Make sure this would actually generate an install.
            if (!hasInstallable)
            {
                throw new Kraken(string.Format("Module contains no files matching: {0}",
                                               module.DescribeInstallStanzas(_game)));
            }

            // Make sure no paths include GameData other than at the start
            if (gamedatas.Count > 0)
            {
                throw new Kraken(
                    string.Join(Environment.NewLine,
                                gamedatas.GroupBy(tuple => tuple.Item2,
                                                  tuple => tuple.Item1)
                                         .OrderBy(grp => grp.Key)
                                         .Select(grp => string.Format("{0} directory found within {0}:{1}{2}",
                                                                      grp.Key,
                                                                      Environment.NewLine,
                                                                      string.Join(Environment.NewLine,
                                                                                  grp.Order())))));
            }

            // Make sure we won't try to overwrite our own files
            if (overwrites.Count > 0)
            {
                var badPaths = string.Join(Environment.NewLine, overwrites.Order());
                throw new Kraken($"Multiple files attempted to install to:{Environment.NewLine}{badPaths}");
            }

            // Not a perfect check (subject to false negatives)
            // but better than nothing
            if (unmatchedIncludeOnlys.Count > 0)
            {
                log.WarnFormat("No matches for include_only: {0}",
                               string.Join(", ", unmatchedIncludeOnlys));
            }
        }

        private readonly IGame           _game;
        private readonly HashSet<string> modDirs;

        private          bool                      hasInstallable;
        private readonly HashSet<(string, string)> gamedatas           = new HashSet<(string, string)>();
        private readonly HashSet<string>           relDests            = new HashSet<string>();
        private readonly HashSet<string>           overwrites          = new HashSet<string>();
        private readonly HashSet<string>           unmatchedIncludeOnlys;

        private static readonly ILog log = LogManager.GetLogger(typeof(InstallsFilesValidator));
    }
}
