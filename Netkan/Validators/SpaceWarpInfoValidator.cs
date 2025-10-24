using System;
using System.Collections.Generic;
using System.Linq;

using SharpCompress.Common;
using log4net;

using CKAN.IO;
using CKAN.SpaceWarp;
using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;

namespace CKAN.NetKAN.Validators
{
    internal sealed class SpaceWarpInfoValidator : IContentValidator
    {
        public SpaceWarpInfoValidator(ISpaceWarpInfoLoader loader)
        {
            swinfoLoader = loader;
        }

        public void VisitContainedFile(Metadata                             metadata,
                                       CkanModule                           module,
                                       IEntry                               entry,
                                       IReadOnlyCollection<InstallableFile> installsAs,
                                       Func<string>                         getContents)
        {
            if (installsAs.Select(i => i.relDest)
                          .Any(p => p.EndsWith(SpaceWarpInfoFilename))
                && swinfoLoader.Load(getContents()) is SpaceWarpInfo swinfo)
            {
                infos.Add(swinfo);
            }
        }

        public void Validate(Metadata metadata, CkanModule module)
        {
            if (infos.Count > 0)
            {
                var moduleDeps = (module.depends?.OfType<ModuleRelationshipDescriptor>()
                                                 .Select(r => r.name)
                                                ?? Enumerable.Empty<string>())
                                  .ToHashSet();
                var missingDeps = infos.SelectMany(swinfo => (swinfo.dependencies
                                                                    ?.Select(dep => dep.id)
                                                                     .OfType<string>()
                                                                     .Where(depId => !moduleDeps.Contains(
                                                                         // Remove up to last period
                                                                         Identifier.Sanitize(
                                                                             depId[(depId.LastIndexOf('.') + 1)..], ""),
                                                                         // Case insensitive
                                                                         StringComparer.InvariantCultureIgnoreCase))
                                                                    ?? Enumerable.Empty<string>()))
                                       .ToList();
                if (missingDeps.Count > 0)
                {
                    log.WarnFormat("Dependencies from swinfo.json missing from module: {0}",
                                   string.Join(", ", missingDeps));
                }
            }
        }

        private readonly ISpaceWarpInfoLoader swinfoLoader;
        private readonly List<SpaceWarpInfo>  infos = new List<SpaceWarpInfo>();

        private const string SpaceWarpInfoFilename = "swinfo.json";
        private static readonly ILog log = LogManager.GetLogger(typeof(SpaceWarpInfoValidator));
    }
}
