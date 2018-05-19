using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using CKAN.Versioning;

namespace CKAN.Edge
{
    public class ModuleDetails
    {

        public async Task<dynamic> Get(dynamic input)
        {
            return await Task.Run(() =>
            {
                string identifier = input as string;
                CkanModule main = getModule(identifier);
                if (main == null)
                {
                    throw new Exception($"Module {identifier} not found");
                }
                return new
                {
                    Identifier    = main.identifier,
                    Description   = main.description,

                    Licenses      = main.license.Select(l => l.ToString()).ToArray(),
                    DownloadHost  = main.download.Host,
                    DownloadSize  = main.download_size,

                    Homepage      = main.resources?.homepage,
                    Repository    = main.resources?.repository,
                    Screenshot    = main.resources?.x_screenshot,

                    Versions      = getVersions(identifier),
                    Relationships = getRelationships(main, new HashSet<string>(), 2)
                };
            });
        }

        private CkanModule getModule(string identifier)
        {
            if (identifier == null)
            {
                return null;
            }
            CkanModule module = null;
            try
            {
                module = SharedState.Registry.LatestAvailable(
                    identifier,
                    SharedState.Manager.CurrentInstance?.VersionCriteria()
                );
            }
            catch { }
            if (module == null) {
                try
                {
                    module = SharedState.Registry.LatestAvailable(
                        identifier,
                        null
                    );
                }
                catch { }
            }
            if (module == null) {
                try
                {
                    module = SharedState.Registry.InstalledModule(identifier)?.Module;
                }
                catch { }
            }
            return module;
        }

        public async Task<dynamic> GetMoreRelationships(dynamic input)
        {
            string identifier = input.Identifier as string;
            var    ancestors  = new HashSet<string>(
                ((object[]) input.Ancestors)
                    .Select((object o) => o.ToString())
            );

            return await Task.Run(() =>
                getRelationships(getModule(identifier), ancestors, 2)
            );
        }

        private bool hasRelationships(CkanModule module)
        {
            return module != null && (
                   module.depends    != null
                || module.recommends != null
                || module.suggests   != null
                || module.supports   != null
                || module.conflicts  != null
            );
        }

        private dynamic getRelationships(CkanModule module, HashSet<string> alreadyShown, int getDepth)
        {
            return (module == null || !hasRelationships(module) || getDepth <= 0) ? null
                : new
                {
                    Depends    = getRelationshipChildren(module, module.depends,    alreadyShown, getDepth),
                    Recommends = getRelationshipChildren(module, module.recommends, alreadyShown, getDepth),
                    Suggests   = getRelationshipChildren(module, module.suggests,   alreadyShown, getDepth),
                    Supports   = getRelationshipChildren(module, module.supports,   alreadyShown, getDepth),
                    Conflicts  = getRelationshipChildren(module, module.conflicts,  alreadyShown, getDepth)
                };
        }

        private dynamic getRelationshipChildren(CkanModule parent, List<RelationshipDescriptor> relationships, HashSet<string> alreadyShown, int getDepth)
        {
            if (relationships == null || relationships.Count == 0)
            {
                return null;
            }
            else
            {
                // TODO: Virtual ("provides") modules
                HashSet<string> ancestors = new HashSet<string>(alreadyShown);
                ancestors.Add(parent.identifier);
                return relationships.Select<RelationshipDescriptor, dynamic>(relationship =>
                {
                    string identifier = (relationship as ModuleRelationshipDescriptor)?.name;
                    return new
                    {
                        Identifier    = identifier,
                        Relationships = (getDepth <= 0 || ancestors.Contains(identifier))
                            ? null
                            : getRelationships(getModule(identifier), ancestors, getDepth - 1)
                    };
                })
                .ToArray();
            }
        }

        private dynamic getVersions(string identifier)
        {
            try {
                return SharedState.Registry.AllAvailable(identifier).Select(mod => {
                    ModuleVersion minMod = null, maxMod = null;
                    KspVersion    minKsp = null, maxKsp = null;
                    Registry.GetMinMaxVersions(new List<CkanModule>() {mod}, out minMod, out maxMod, out minKsp, out maxKsp);

                    return new
                    {
                        Version            = mod.version?.ToString(),
                        MinimumGameVersion = minKsp?.ToString(),
                        MaximumGameVersion = maxKsp?.ToString(),
                        GameVersionRange   = KspVersionRange.VersionSpan(minKsp, maxKsp).ToString()
                        // TODO: Check if installed
                        // TODO: Check if compatible
                    };
                });
            }
            catch { }
            return null;
        }

        public async Task<dynamic> GetModuleContents(dynamic input)
        {
            string identifier = input as string;
            return await Task.Run(() => getContents(getModule(identifier)));
        }

        private dynamic getContents(CkanModule module)
        {
            return module == null ? null
                : !(SharedState.Cache?.IsMaybeCachedZip(module) ?? false) ? new string[] { }
                : SharedState.Installer?.GetModuleContentsList(module, true)
                    .OrderBy(s => s)
                    .ToArray();
        }

    }
}
