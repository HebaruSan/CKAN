using System.Collections.Generic;
using System.Linq;
using log4net;
using CKAN.Versioning;

namespace CKAN
{
    /// <summary>
    /// Class to track which mods are compatible with a given set of versions.
    /// Handles all levels of dependencies.
    /// </summary>
    public class CompatibilitySorter
    {
        /// <summary>
        /// Initialize the sorter and partition the mods.
        /// </summary>
        /// <param name="crit">Versions to be considered compatible</param>
        /// <param name="available">Collection of mods from registry</param>
        public CompatibilitySorter(
            KspVersionCriteria crit,
            Dictionary<string, AvailableModule> available,
            Dictionary<string, HashSet<AvailableModule>> providers,
            HashSet<string> dlls,
            Dictionary<string, UnmanagedModuleVersion> dlc
        )
        {
            CompatibleVersions = crit;
            this.dlls = dlls;
            this.dlc  = dlc;
            PartitionModules(available, providers);
        }

        /// <summary>
        /// Version criteria that this partition represents
        /// </summary>
        public readonly KspVersionCriteria CompatibleVersions;

        /// <summary>
        /// Mods that are compatible with our versions
        /// </summary>
        public readonly SortedDictionary<string, AvailableModule> Compatible
            = new SortedDictionary<string, AvailableModule>();

        /// <summary>
        /// Mods that are incompatible with our versions
        /// </summary>
        public readonly SortedDictionary<string, AvailableModule> Incompatible
            = new SortedDictionary<string, AvailableModule>();

        /// <summary>
        /// Mods that might be compatible or incompatible based on their dependencies
        /// </summary>
        private readonly SortedDictionary<string, AvailableModule> Indeterminate = new SortedDictionary<string, AvailableModule>();

        /// <summary>
        /// Mods for which we have an active call to CheckDepends right now
        /// in the call stack, used to avoid infinite recursion on circular deps.
        /// </summary>
        private readonly Stack<string> Investigating = new Stack<string>();

        private readonly HashSet<string> dlls;
        private readonly Dictionary<string, UnmanagedModuleVersion> dlc;

        /// <summary>
        /// Split the given mods into compatible and incompatible.
        /// Handles all levels of dependencies.
        /// </summary>
        /// <param name="available">All mods available from registry</param>
        private void PartitionModules(Dictionary<string, AvailableModule> available, Dictionary<string, HashSet<AvailableModule>> providers)
        {
            // First get the ones that are trivially [in]compatible.
            foreach (var kvp in available)
            {
                if (kvp.Value.AllAvailable().All(m => !m.IsCompatibleKSP(CompatibleVersions)))
                {
                    // No versions compatible == incompatible
                    log.DebugFormat("Trivially incompatible: {0}", kvp.Key);
                    Incompatible.Add(kvp.Key, kvp.Value);
                }
                else if (kvp.Value.AllAvailable().All(m => m.depends == null))
                {
                    // No dependencies == compatible
                    log.DebugFormat("Trivially compatible: {0}", kvp.Key);
                    Compatible.Add(kvp.Key, kvp.Value);
                }
                else
                {
                    // Need to investigate this one more later
                    log.DebugFormat("Trivially indeterminate: {0}", kvp.Key);
                    Indeterminate.Add(kvp.Key, kvp.Value);
                }
            }
            // We'll be modifying `indeterminate` during this loop, so `foreach` is out
            while (Indeterminate.Count > 0)
            {
                var kvp = Indeterminate.First();
                log.DebugFormat("Checking: {0}", kvp.Key);
                CheckDepends(kvp.Key, kvp.Value, providers);
            }
        }

        /// <summary>
        /// Move an indeterminate module to Compatible or Incompatible
        /// based on its dependencies.
        /// </summary>
        /// <param name="indeterminate">The collection of indeterminate modules</param>
        /// <param name="identifier">Identifier of the module to check</param>
        /// <param name="am">The module to check</param>
        private void CheckDepends(string identifier, AvailableModule am, Dictionary<string, HashSet<AvailableModule>> providers)
        {
            Investigating.Push(identifier);
            foreach (CkanModule m in am.AllAvailable().Where(m => m.IsCompatibleKSP(CompatibleVersions)))
            {
                log.DebugFormat("What about {0}?", m.version);
                bool installable = true;
                if (m.depends != null)
                {
                    foreach (RelationshipDescriptor rel in m.depends)
                    {
                        var candidates = RelationshipIdentifiers(rel)
                            .Where(ident => providers.ContainsKey(ident))
                            .SelectMany(ident => providers[ident])
                            .Distinct();
                        bool foundCompat = false;
                        if (rel.MatchesAny(null, dlls, dlc))
                        {
                            // Matches a DLL or DLC, cool
                            foundCompat = true;
                        }
                        else
                        {
                            foreach (AvailableModule provider in candidates)
                            {
                                string ident = provider.AllAvailable().First().identifier;
                                log.DebugFormat("Checking depends: {0}", ident);
                                if (Investigating.Contains(ident))
                                {
                                    // Circular dependency, pretend it's fine for now
                                    foundCompat = true;
                                    break;
                                }
                                if (Indeterminate.ContainsKey(ident))
                                {
                                    CheckDepends(ident, provider, providers);
                                }
                                if (Compatible.ContainsKey(ident))
                                {
                                    // This one's OK, go to next relationship
                                    foundCompat = true;
                                    break;
                                }
                            }
                        }
                        if (!foundCompat)
                        {
                            // Not satisfiable!! Next CkanModule
                            installable = false;
                            break;
                        }
                    }
                }
                if (installable)
                {
                    // Apparently everything is OK, so we are compatible
                    log.DebugFormat("Complexly compatible: {0}", identifier);
                    Compatible.Add(identifier, am);
                    Indeterminate.Remove(identifier);
                    Investigating.Pop();
                    return;
                }
            }
            // None of the CkanModules can be installed!
            log.DebugFormat("Complexly incompatible: {0}", identifier);
            Incompatible.Add(identifier, am);
            Indeterminate.Remove(identifier);
            Investigating.Pop();
        }

        /// <summary>
        /// Find the identifiers that could satisfy this relationship.
        /// Handles the different types of relationships.
        /// </summary>
        /// <param name="rel">Relationship to satisfy</param>
        /// <returns>
        /// The identifier for a ModuleRelationshipDescriptor,
        /// multiple for AnyOfRelationshipDescriptor,
        /// nothing otherwise.
        /// </returns>
        private IEnumerable<string> RelationshipIdentifiers(RelationshipDescriptor rel)
        {
            var modRel = rel as ModuleRelationshipDescriptor;
            if (modRel != null)
            {
                yield return modRel.name;
            }
            else
            {
                var anyRel = rel as AnyOfRelationshipDescriptor;
                if (anyRel != null)
                {
                    foreach (RelationshipDescriptor subRel in anyRel.any_of)
                    {
                        foreach (string name in RelationshipIdentifiers(subRel))
                        {
                            yield return name;
                        }
                    }
                }
            }
        }

        private static readonly ILog log = LogManager.GetLogger(typeof(CompatibilitySorter));
    }
}
