using System;
using System.Collections.Generic;

using SharpCompress.Common;
using Newtonsoft.Json.Linq;
using log4net;

using CKAN.Versioning;
using CKAN.SpaceWarp;
using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;
using CKAN.NetKAN.Extensions;

namespace CKAN.NetKAN.Transformers
{
    internal sealed class SpaceWarpInfoTransformer : IContentTransformer
    {
        public SpaceWarpInfoTransformer(SpaceWarpInfoLoader loader)
        {
            swinfoLoader = loader;
        }

        public string Name => "space_warp_info";

        public void VisitContainedFile(Metadata     metadata,
                                       CkanModule   module,
                                       IEntry       entry,
                                       bool         installing,
                                       Func<string> getContents)
        {
                if (metadata.Vref?.Source == "space-warp"
                    && installing
                    && (metadata.Vref.Id != null
                           ? entry.Key == metadata.Vref.Id
                           : (entry.Key?.EndsWith(SpaceWarpInfoFilename) ?? false))
                    && swinfoLoader.Load(getContents()) is SpaceWarpInfo swinfo)
                {
                    infos.Add(swinfo);
                }
        }

        public Metadata Transform(Metadata metadata)
        {
            if (metadata.Vref?.Source == "space-warp"
                && infos.Count > 0)
            {
                var json = metadata.Json();
                foreach (var info in infos)
                {
                    var swinfo = info;
                    if (swinfo.version_check != null
                        && Uri.IsWellFormedUriString(swinfo.version_check.OriginalString, UriKind.Absolute))
                    {
                        var resourcesJson = (JObject?)json["resources"];
                        if (resourcesJson == null)
                        {
                            json["resources"] = resourcesJson = new JObject();
                        }
                        resourcesJson.SafeAdd("remote-swinfo", swinfo.version_check.OriginalString);
                    }

                    json.SafeAdd("name",     swinfo.name);
                    json.SafeAdd("author",   swinfo.author);
                    json.SafeAdd("abstract", swinfo.description);
                    json.SafeAdd("version",  swinfo.version);
                    bool hasMin = GameVersion.TryParse(swinfo.ksp2_version?.min, out GameVersion? minVer);
                    bool hasMax = GameVersion.TryParse(swinfo.ksp2_version?.max, out GameVersion? maxVer);
                    if (hasMin || hasMax)
                    {
                        log.InfoFormat("Found compatibility: {0}–{1}", minVer?.WithoutBuild,
                                                                       maxVer?.WithoutBuild);
                        GameVersion.SetJsonCompatibility(json, null, minVer?.WithoutBuild,
                                                                     maxVer?.WithoutBuild);
                    }
                    log.DebugFormat("Transformed metadata:{0}{1}",
                                    Environment.NewLine, json);
                }
                return new Metadata(json);
            }
            return metadata;
        }

        private readonly SpaceWarpInfoLoader swinfoLoader;

        private readonly List<SpaceWarpInfo> infos = new List<SpaceWarpInfo>();

        private const string SpaceWarpInfoFilename = "swinfo.json";

        private static readonly ILog log = LogManager.GetLogger(typeof(SpaceWarpInfoTransformer));
    }
}
