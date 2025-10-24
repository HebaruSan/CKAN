using System;
using System.Collections.Generic;
using System.Linq;

using SharpCompress.Common;
using log4net;

using CKAN.IO;
using CKAN.Games;
using CKAN.Games.KerbalSpaceProgram;
using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Validators
{
    internal sealed class CraftsInShipsValidator : IContentValidator
    {
        public CraftsInShipsValidator(IGame game)
        {
            this.game = game;
        }

        public void VisitContainedFile(Metadata                             metadata,
                                       CkanModule                           module,
                                       IEntry                               entry,
                                       IReadOnlyCollection<InstallableFile> installsAs,
                                       Func<string>                         getContents)
        {
            if (game is KerbalSpaceProgram)
            {
                badCrafts.UnionWith(
                    installsAs.Select(i => i.relDest)
                              .Where(p => p.EndsWith(".craft", StringComparison.InvariantCultureIgnoreCase)
                                          && !AllowedCraftPath(p)));
            }
        }

        public void Validate(Metadata metadata, CkanModule module)
        {
            if (game is KerbalSpaceProgram)
            {
                log.Debug("Validating that craft files are installed into Ships");
                if (badCrafts.Count > 0)
                {
                    log.WarnFormat("Craft files installed outside Ships folder: {0}",
                                   string.Join(", ", badCrafts.Order()));
                }
            }
        }

        private static bool AllowedCraftPath(string path)
            => path.StartsWith("Ships/")
               || path.StartsWith("Missions/")
               || path.StartsWith("GameData/ContractPacks/");

        private readonly IGame           game;
        private readonly HashSet<string> badCrafts = new HashSet<string>();

        private static readonly ILog log = LogManager.GetLogger(typeof(CraftsInShipsValidator));
    }
}
