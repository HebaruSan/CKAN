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
    internal sealed class PluginsValidator : IContentValidator
    {
        public PluginsValidator(IGame game)
        {
            _game = game;
        }

        public void VisitContainedFile(Metadata                             metadata,
                                       CkanModule                           module,
                                       IEntry                               entry,
                                       IReadOnlyCollection<InstallableFile> installsAs,
                                       Func<string>                         getContents)
        {
            plugins.UnionWith(installsAs.Select(i => i.relDest)
                                        .Where(p => p.EndsWith(".dll", StringComparison.InvariantCultureIgnoreCase)));
            sourceCode.UnionWith(installsAs.Select(i => i.relDest)
                                           .Where(p => sourceCodeSuffixes.Any(suf => p.EndsWith(suf, StringComparison.InvariantCultureIgnoreCase))));
        }

        public void Validate(Metadata metadata, CkanModule module)
        {
            log.Debug("Validating that metadata is appropriate for DLLs");
            if (plugins.Count > 0)
            {
                if (plugins.Select(pl => GameInstance.DllPathToIdentifier(_game, pl))
                           .OfType<string>()
                           .Where(ident => ident is { Length: > 0 }
                                           && !identifiersToIgnore.Contains(ident))
                           .ToHashSet()
                    is { Count: > 0 } dllIdentifiers
                    && !dllIdentifiers.Contains(metadata.Identifier))
                {
                    log.WarnFormat("No plugin matching the identifier, manual installations won't be detected: {0}",
                                   string.Join(", ", plugins));
                }

                var json = metadata.AllJson;
                bool boundedCompatibility = json.ContainsKey("ksp_version")
                                            || json.ContainsKey("ksp_version_max");
                if (!boundedCompatibility)
                {
                    log.Warn("Unbounded future compatibility for module with a plugin, consider setting $vref or ksp_version or ksp_version_max");
                }
            }
            else if (sourceCode.Count > 0)
            {
                log.WarnFormat("Found C# source code without DLL, mod may not have been compiled: {0}",
                               string.Join(", ", sourceCode));
            }
        }

        /// <summary>
        /// These identifiers will not be treated as potential auto-detected mods
        /// for purposes of the identifier-matching warning,
        /// because they are commonly bundled and installed by other mods,
        /// which may or may not have their own plugins.
        /// </summary>
        private readonly string[] identifiersToIgnore = new string[]
        {
            "MiniAVC"
        };

        private readonly IGame _game;

        private readonly HashSet<string> plugins    = new HashSet<string>();
        private readonly HashSet<string> sourceCode = new HashSet<string>();

        private static readonly string[] sourceCodeSuffixes = new string[] { ".cs", ".csproj", ".sln" };

        private static readonly ILog log = LogManager.GetLogger(typeof(PluginsValidator));
    }
}
