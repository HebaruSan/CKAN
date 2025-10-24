using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

using SharpCompress.Common;
using Newtonsoft.Json.Linq;
using log4net;

using CKAN.NetKAN.Extensions;
using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Transformers
{
    internal sealed class LocalizationsTransformer : IContentTransformer
    {
        /// <summary>
        /// Name of this transformer
        /// </summary>
        public string Name => "localizations";

        public void VisitContainedFile(Metadata     metadata,
                                       CkanModule   mod,
                                       IEntry       entry,
                                       bool         installing,
                                       Func<string> getContents)
        {
            // We can't know whether the file will be installed without the shortestLength scan!
            if (installing
                && !metadata.AllJson.ContainsKey(localizationsProperty))
            {
                locales.UnionWith(
                    localizationRegex.Matches(getContents())
                                     .OfType<Match>()
                                     .Select(m => m.Groups["contents"].Value)
                                     .SelectMany(loc => localeRegex.Matches(loc)
                                                                   .OfType<Match>()
                                                                   .Where(m => m.Groups["contents"]
                                                                                .Value
                                                                                .Contains("="))
                                                                   .Select(m => m.Groups["locale"].Value)));
            }
        }

        /// <summary>
        /// Apply the locale transformation to the metadata
        /// </summary>
        /// <param name="metadata">Data about the module</param>
        /// <returns>
        /// Updated metadata with the `locales` property set
        /// </returns>
        public Metadata Transform(Metadata metadata)
        {
            if (locales.Any())
            {
                var json = metadata.Json();
                json.SafeAdd(localizationsProperty, new JArray(locales.Order()));
                log.Debug("Localizations property set");
                return new Metadata(json);
            }
            return metadata;
        }

        private const string localizationsProperty = "localizations";

        private readonly HashSet<string> locales = new HashSet<string>();

        private static readonly ILog log = LogManager.GetLogger(typeof(LocalizationsTransformer));

        private static readonly Regex localizationRegex = new Regex(
            @"^\s*Localization\b\s*{(?<contents>[^{}]+({[^{}]*}[^{}]*)+)}",
            RegexOptions.Compiled | RegexOptions.Multiline | RegexOptions.Singleline
        );
        private static readonly Regex localeRegex = new Regex(
            @"^\s*(?<locale>[-a-zA-Z]+).*?{(?<contents>.*?)}",
            RegexOptions.Compiled | RegexOptions.Multiline | RegexOptions.Singleline
        );

    }
}
