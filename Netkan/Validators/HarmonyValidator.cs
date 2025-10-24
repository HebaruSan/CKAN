using System;
using System.Collections.Generic;
using System.Linq;

using SharpCompress.Common;
using log4net;

using CKAN.IO;
using CKAN.Games;
using CKAN.NetKAN.Model;
using CKAN.Games.KerbalSpaceProgram;

namespace CKAN.NetKAN.Validators
{
    internal sealed class HarmonyValidator : IContentValidator
    {
        public HarmonyValidator(IGame game)
        {
            _game = game;
        }

        public void VisitContainedFile(Metadata                             metadata,
                                       CkanModule                           module,
                                       IEntry                               entry,
                                       IReadOnlyCollection<InstallableFile> installsAs,
                                       Func<string>                         getContents)
        {
            if (_game is KerbalSpaceProgram
                && module is { IsDLC:      false,
                               identifier: not "Harmony2" })
            {
                harmonyDLLs.UnionWith(installsAs.Select(i => i.relDest)
                                                .Where(p => p.EndsWith(".dll", StringComparison.InvariantCultureIgnoreCase)
                                                            && p.IndexOf("Harmony",
                                                                         Math.Max(0, p.LastIndexOf('/')),
                                                                         StringComparison.InvariantCultureIgnoreCase) != -1));
            }
        }

        public void Validate(Metadata metadata, CkanModule module)
        {
            // The Harmony2 module is allowed to install a Harmony DLL;
            // anybody else must have "provides":["Harmony1"] to do so
            if (_game is KerbalSpaceProgram
                && module is { IsDLC:      false,
                               identifier: not "Harmony2" })
            {
                bool bundlesHarmony   = harmonyDLLs.Count > 0;
                bool providesHarmony1 = module.ProvidesList.Contains("Harmony1");
                if (bundlesHarmony && !providesHarmony1)
                {
                    throw new Kraken($"Harmony DLL found at {string.Join(", ", harmonyDLLs.Order())}, but Harmony1 is not in the provides list");
                }
                else if (providesHarmony1 && !bundlesHarmony)
                {
                    Log.Warn("Harmony1 provided by module that doesn't install a Harmony DLL, consider removing from provides list");
                }
            }
        }

        private readonly IGame _game;

        private readonly HashSet<string> harmonyDLLs = new HashSet<string>();

        private static readonly ILog Log = LogManager.GetLogger(typeof(HarmonyValidator));
    }
}
