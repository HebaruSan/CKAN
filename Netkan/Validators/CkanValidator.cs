using System.Linq;
using System.IO;

using SharpCompress.Archives;

using CKAN.IO;
using CKAN.Games;
using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;
using CKAN.NetKAN.Extensions;

namespace CKAN.NetKAN.Validators
{
    internal sealed class CkanValidator : IValidator
    {
        public CkanValidator(IHttpService         downloader,
                             ISpaceWarpInfoLoader swinfoLoader,
                             IGame                game)
        {
            this.downloader   = downloader;
            this.swinfoLoader = swinfoLoader;
            this.game         = game;

            validators = new IValidator[]
            {
                new IsCkanModuleValidator(),
                new DownloadArrayValidator(),
                new TagsValidator(),
                new LicensesValidator(),
                new RelationshipsValidator(),
                new VersionStrictValidator(),
                new ReplacedByValidator(),
                new InstallValidator(),
                new MatchesKnownGameVersionsValidator(game),
                new ObeysCKANSchemaValidator(),
                new KindValidator(),
            };
        }

        public void Validate(Metadata metadata)
        {
            foreach (var validator in validators)
            {
                validator.Validate(metadata);
            }
            var moduleJson = metadata.Json();
            moduleJson.SafeAdd("version", "1");
            var module = CkanModule.FromJson(moduleJson.ToString());

            if (!module.IsDLC
                && downloader.DownloadModule(metadata) is { Length: > 0 } archivePath)
            {
                var contentValidators = new IContentValidator[]
                {
                    new InstallsFilesValidator(game, module),
                    new HarmonyValidator(game),
                    new ModuleManagerDependsValidator(),
                    new PluginsValidator(game),
                    new CraftsInShipsValidator(game),
                    new SpaceWarpInfoValidator(swinfoLoader),
                };

                using (var archive = ArchiveFactory.Open(archivePath))
                {
                    var (files, _) = ModuleInstaller.GetInstallableFiles(module, archive, game);

                    foreach (var entry in archive.Entries)
                    {
                        string? contents   = null;
                        var     installsAs = files[entry.Key ?? ""].ToArray();
                        foreach (var contVal in contentValidators)
                        {
                            contVal.VisitContainedFile(metadata, module,
                                                       entry, installsAs,
                                                       () => contents ??= ReadToEnd(entry.OpenEntryStream()));
                        }
                    }
                }
                foreach (var contVal in contentValidators)
                {
                    contVal.Validate(metadata, module);
                }
            }
        }

        private static string ReadToEnd(Stream s)
        {
            using (s)
            using (var innerReader = new StreamReader(s))
            {
                return innerReader.ReadToEnd();
            }
        }

        public void ValidateCkan(Metadata metadata, Metadata netkan)
        {
            Validate(metadata);
            new MatchingIdentifiersValidator(netkan.Identifier).Validate(metadata);
        }

        private readonly IHttpService         downloader;
        private readonly ISpaceWarpInfoLoader swinfoLoader;
        private readonly IGame                game;
        private readonly IValidator[]         validators;
    }
}
