using System;
using System.Collections.Generic;
using System.Linq;

using SharpCompress.Common;
using Newtonsoft.Json.Linq;
using log4net;

using CKAN.Extensions;
using CKAN.Versioning;
using CKAN.NetKAN.Extensions;
using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Transformers
{
    /// <summary>
    /// An <see cref="ITransformer"/> that populates data from a CKAN file included in the distribution package.
    /// </summary>
    internal sealed class InternalCkanTransformer : IContentTransformer
    {
        public string Name => "internal_ckan";

        public void VisitContainedFile(Metadata     metadata,
                                       CkanModule   mod,
                                       IEntry       entry,
                                       bool         installing,
                                       Func<string> getContents)
        {
            if (installing
                && ModuleInstallDescriptor.IsInternalCkan(entry.Key ?? ""))
            {
                internalJsons.AddRange(YamlExtensions.Parse(getContents())
                                                     .Select(yaml => yaml.ToJObject()));
            }
        }

        public Metadata Transform(Metadata metadata)
        {
            if (internalJsons.Count > 0)
            {
                var json = metadata.Json();
                foreach (var internalJson in internalJsons)
                {
                    Log.InfoFormat("Executing internal CKAN transformation with {0}", metadata.Kref);
                    Log.DebugFormat("Input metadata:{0}{1}", Environment.NewLine, metadata.AllJson);

                    foreach (var property in internalJson.Properties())
                    {
                        // We've already got the file, too late to tell us where it lives
                        if (property.Name == "$kref")
                        {
                            Log.DebugFormat("Skipping $kref property: {0}", property.Value);
                            continue;
                        }
                        json.SafeAdd(property.Name, property.Value);
                    }

                    GameVersion.SetJsonCompatibility(json, null, null, null);
                    json.SafeMerge("resources", internalJson["resources"]);

                }
                Log.DebugFormat("Transformed metadata:{0}{1}", Environment.NewLine, json);
                return new Metadata(json);
            }
            return metadata;
        }

        private readonly List<JObject> internalJsons = new List<JObject>();

        private static readonly ILog Log = LogManager.GetLogger(typeof(InternalCkanTransformer));
    }
}
