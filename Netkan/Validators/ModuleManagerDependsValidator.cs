using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

using SharpCompress.Common;
using log4net;

using CKAN.IO;
using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Validators
{
    internal sealed class ModuleManagerDependsValidator : IContentValidator
    {
        public void VisitContainedFile(Metadata                             metadata,
                                       CkanModule                           module,
                                       IEntry                               entry,
                                       IReadOnlyCollection<InstallableFile> installsAs,
                                       Func<string>                         getContents)
        {
            if (entry.Key != null
                && installsAs.Any(p => p.relDest.EndsWith(".cfg", StringComparison.InvariantCultureIgnoreCase))
                && moduleManagerRegex.IsMatch(getContents()))
            {
                mmConfigs.Add(entry.Key);
            }
        }

        public void Validate(Metadata metadata, CkanModule module)
        {
            Log.Debug("Validating that metadata dependencies are consistent with cfg file syntax");
            bool dependsOnMM = module.depends?.Any(r => r.ContainsAny(identifiers)) ?? false;
            if (!dependsOnMM && mmConfigs.Any())
            {
                Log.WarnFormat("ModuleManager syntax used without ModuleManager dependency: {0}",
                               string.Join(", ", mmConfigs.Order()));
            }
            else if (dependsOnMM && !mmConfigs.Any())
            {
                Log.Warn("ModuleManager dependency may not be needed, no ModuleManager syntax found");
            }
        }

        private readonly List<string> mmConfigs = new List<string>();

        private static readonly string[] identifiers = new string[] { "ModuleManager" };

        private static readonly Regex moduleManagerRegex =
            new Regex(@"^\s*[@+$\-!%]|^\s*[a-zA-Z0-9_]+:",
                      RegexOptions.Compiled | RegexOptions.Multiline | RegexOptions.Singleline);

        private static readonly ILog Log = LogManager.GetLogger(typeof(ModuleManagerDependsValidator));
    }
}
