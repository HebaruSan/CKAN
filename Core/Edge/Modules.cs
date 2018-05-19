using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CKAN.Edge
{
    public class Modules
    {

        public async Task<object> Installed(dynamic input)
        {
            return await Task.Run(() =>
                SharedState.Registry.InstalledModules
                    .Select(module => edgeModule(module.Module, false, true))
                    .OrderBy(module => module.Name)
                    // Put the upgradeable mods on top
                    .OrderBy(module => !module.Upgradeable)
                    .ToArray()
            );
        }

        public async Task<object> Available(dynamic input)
        {
            HashSet<string> installed = new HashSet<string>(
                SharedState.Registry.InstalledModules
                    .Select(module => module.Module.identifier)
            );
            return await Task.Run(() =>
                SharedState.Registry.Available(SharedState.Manager.CurrentInstance.VersionCriteria())
                    .Where(module => !installed.Contains(module.identifier))
                    .Select(module => edgeModule(module, true, false, false))
                    .OrderBy(module => module.Name)
                    .ToArray()
            );
        }

        public async Task<object> Incompatible(dynamic input)
        {
            return await Task.Run(() =>
                SharedState.Registry.Incompatible(SharedState.Manager.CurrentInstance.VersionCriteria())
                    .Select(module => edgeModule(module, false, false, false))
                    .OrderBy(module => module.Name)
                    .ToArray()
            );
        }

        private static dynamic edgeModule(CkanModule module, bool installable, bool installed, bool? upgradeable = null)
        {
            return new
            {
                Identifier   = module.identifier,
                Name         = module.name.Trim(),
                Abstract     = module.@abstract,
                Authors      = module.author,
                Version      = module.version.ToString(),
                Abbrev       = module.name.Split(' ')
                                .Where(s => s.Length > 0)
                                .Select(s => s[0].ToString())
                                .Aggregate((a, b) => a + b)
                                .ToLower(),

                Installable  = installable,
                Installed    = installed,
                Upgradeable  = upgradeable ?? IsUpgradeable(module)
            };
        }

        private static bool IsUpgradeable(CkanModule module)
        {
            try
            {
                return SharedState.Registry.LatestAvailable(
                    module.identifier,
                    SharedState.Manager.CurrentInstance.VersionCriteria()
                )?.version.IsGreaterThan(module.version) ?? false;
            }
            catch (ModuleNotFoundKraken)
            {
                // This module isn't available, so it can't be upgraded
                return false;
            }
        }

        public async Task<object> Refresh(dynamic input)
        {
            return await Task.Run(async () =>
            {
                CapturingUser myUser = new CapturingUser();

                RepoUpdateResult result = Repo.UpdateAllRepositories(
                    RegistryManager.Instance(SharedState.Manager.CurrentInstance),
                    SharedState.Manager.CurrentInstance,
                    SharedState.Manager?.Cache,
                    myUser
                );

                if (myUser.Errors.Count > 0 || result == RepoUpdateResult.Failed)
                {
                    throw new Exception(myUser.ToString());
                }
                else
                {
                    return new
                    {
                        installed    = await Installed(input),
                        available    = await Available(input),
                        incompatible = await Incompatible(input)
                    };
                }
            });
        }

    }

}
