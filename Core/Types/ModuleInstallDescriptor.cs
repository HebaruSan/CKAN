using System;
using System.IO;
using System.ComponentModel;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Text.RegularExpressions;
using System.Runtime.CompilerServices;
using System.Reflection;
using System.Diagnostics.CodeAnalysis;

using SharpCompress.Archives;
using Newtonsoft.Json;

using CKAN.IO;
using CKAN.Games;

[assembly: InternalsVisibleTo("CKAN.Tests")]

namespace CKAN
{
    [JsonObject(MemberSerialization.OptIn)]
    public class ModuleInstallDescriptor : IEquatable<ModuleInstallDescriptor>
    {

        #region Properties

        // Either file, find, or find_regexp is required, we check this manually at deserialise.
        [JsonProperty("file", NullValueHandling = NullValueHandling.Ignore)]
        public string? file;

        [JsonProperty("find", NullValueHandling = NullValueHandling.Ignore)]
        public string? find;

        [JsonProperty("find_regexp", NullValueHandling = NullValueHandling.Ignore)]
        public string? find_regexp;

        [JsonProperty("find_matches_files", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        [DefaultValue(false)]
        public bool find_matches_files = false;

        [JsonProperty("install_to", DefaultValueHandling = DefaultValueHandling.IgnoreAndPopulate)]
        [DefaultValue("GameData")]
        public string? install_to;

        [JsonProperty("as", NullValueHandling = NullValueHandling.Ignore)]
        public string? @as;

        [JsonProperty("filter", NullValueHandling = NullValueHandling.Ignore)]
        [JsonConverter(typeof(JsonSingleOrArrayConverter<string>))]
        public List<string>? filter;

        [JsonProperty("filter_regexp", NullValueHandling = NullValueHandling.Ignore)]
        [JsonConverter(typeof(JsonSingleOrArrayConverter<string>))]
        public List<string>? filter_regexp;

        [JsonProperty("include_only", NullValueHandling = NullValueHandling.Ignore)]
        [JsonConverter(typeof(JsonSingleOrArrayConverter<string>))]
        public List<string>? include_only;

        [JsonProperty("include_only_regexp", NullValueHandling = NullValueHandling.Ignore)]
        [JsonConverter(typeof(JsonSingleOrArrayConverter<string>))]
        public List<string>? include_only_regexp;

        [JsonIgnore]
        private Regex? inst_pattern = null;

        [JsonIgnore]
        private Regex InstallPattern
            => inst_pattern ??= new Regex(
                   this switch
                   {
                       { file:        string f } => $"^{Regex.Escape(CKANPathUtils.NormalizePath(f))}(/|$)",
                       { find:        string f } => $"(?:^|/){Regex.Escape(CKANPathUtils.NormalizePath(f))}(/|$)",
                       { find_regexp: string f } => f,
                       _ => throw new Kraken(Properties.Resources.ModuleInstallDescriptorRequireFileFind),
                   },
                   RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex trailingSlashPattern = new Regex("/$", RegexOptions.Compiled);

        [OnDeserialized]
        internal void DeSerialisationFixes(StreamingContext like_i_could_care)
        {
            // Make sure our install_to fields exists. We may be able to remove
            // this check now that we're doing better json-fu above.
            if (install_to == null)
            {
                throw new BadMetadataKraken(null, Properties.Resources.ModuleInstallDescriptorMustHaveInstallTo);
            }

            var setCount = new[] { file, find, find_regexp }.Count(i => i != null);

            // Make sure we have either a `file`, `find`, or `find_regexp` stanza.
            if (setCount == 0)
            {
                throw new BadMetadataKraken(null, Properties.Resources.ModuleInstallDescriptorRequireFileFind);
            }

            if (setCount > 1)
            {
                throw new BadMetadataKraken(null, Properties.Resources.ModuleInstallDescriptorTooManyFileFind);
            }

            // Make sure only filter or include_only fields exist but not both at the same time
            var filterCount = new[] { filter, filter_regexp }.Count(i => i != null);
            var includeOnlyCount = new[] { include_only, include_only_regexp }.Count(i => i != null);

            if (filterCount > 0 && includeOnlyCount > 0)
            {
                throw new BadMetadataKraken(null, Properties.Resources.ModuleInstallDescriptorTooManyFilterInclude);
            }

            // Normalize paths on load (note, doesn't cover assignment like in tests)
            install_to = CKANPathUtils.NormalizePath(install_to);
        }

        #endregion

        #region Constructors

        [JsonConstructor]
        private ModuleInstallDescriptor()
        {
            install_to = typeof(ModuleInstallDescriptor).GetTypeInfo()
                                                        ?.GetDeclaredField("install_to")
                                                        ?.GetCustomAttribute<DefaultValueAttribute>()
                                                        ?.Value
                                                        ?.ToString();
        }

        /// <summary>
        /// Returns a default install stanza for the identifier provided.
        /// </summary>
        /// <returns>
        /// { "find": "ident", "install_to": "GameData" }
        /// </returns>
        public static ModuleInstallDescriptor DefaultInstallStanza(IGame game, string ident)
            => new ModuleInstallDescriptor()
               {
                   find       = ident,
                   install_to = game.PrimaryModDirectoryRelative,
               };

        #endregion

        /// <summary>
        /// Compare two install stanzas
        /// </summary>
        /// <param name="other">The other stanza for comparison</param>
        /// <returns>
        /// True if they're equivalent, false if they're different.
        /// </returns>
        public override bool Equals(object? other)
            => Equals(other as ModuleInstallDescriptor);

        /// <summary>
        /// Compare two install stanzas
        /// </summary>
        /// <param name="otherStanza">The other stanza for comparison</param>
        /// <returns>
        /// True if they're equivalent, false if they're different.
        /// IEquatable&lt;&gt; uses this for more efficient comparisons.
        /// </returns>
        public bool Equals(ModuleInstallDescriptor? otherStanza)
        {
            if (otherStanza == null)
            {
                // Not even the right type!
                return false;
            }

            if (CKANPathUtils.NormalizePath(file ?? "") != CKANPathUtils.NormalizePath(otherStanza.file ?? ""))
            {
                return false;
            }

            if (CKANPathUtils.NormalizePath(find ?? "") != CKANPathUtils.NormalizePath(otherStanza.find ?? ""))
            {
                return false;
            }

            if (find_regexp != otherStanza.find_regexp)
            {
                return false;
            }

            if (CKANPathUtils.NormalizePath(install_to ?? "") != CKANPathUtils.NormalizePath(otherStanza.install_to ?? ""))
            {
                return false;
            }

            if (@as != otherStanza.@as)
            {
                return false;
            }

            if ((filter == null) != (otherStanza.filter == null))
            {
                return false;
            }

            if (filter != null && otherStanza.filter != null
                && !filter.SequenceEqual(otherStanza.filter))
            {
                return false;
            }

            if ((filter_regexp == null) != (otherStanza.filter_regexp == null))
            {
                return false;
            }

            if (filter_regexp != null && otherStanza.filter_regexp != null
                && !filter_regexp.SequenceEqual(otherStanza.filter_regexp))
            {
                return false;
            }

            if (find_matches_files != otherStanza.find_matches_files)
            {
                return false;
            }

            if ((include_only == null) != (otherStanza.include_only == null))
            {
                return false;
            }

            if (include_only != null && otherStanza.include_only != null
                && !include_only.SequenceEqual(otherStanza.include_only))
            {
                return false;
            }

            if ((include_only_regexp == null) != (otherStanza.include_only_regexp == null))
            {
                return false;
            }

            if (include_only_regexp != null && otherStanza.include_only_regexp != null
                && !include_only_regexp.SequenceEqual(otherStanza.include_only_regexp))
            {
                return false;
            }

            return true;
        }

        public override int GetHashCode()
            // Tuple.Create only handles up to 8 params, we have 10+
            => Tuple.Create(Tuple.Create(file,
                                         find,
                                         find_regexp,
                                         find_matches_files,
                                         install_to,
                                         @as),
                            Tuple.Create(filter,
                                         filter_regexp,
                                         include_only,
                                         include_only_regexp))
                    .GetHashCode();


        /// <summary>
        /// Returns true if the path provided should be installed by this stanza.
        /// </summary>
        private bool IsWanted(string path, int? matchWhere)
        {
            var pat = InstallPattern;

            // Make sure our path always uses slashes we expect.
            string normalised_path = path.Replace('\\', '/');

            var match = pat.Match(normalised_path);
            if (!match.Success)
            {
                // Doesn't match our install pattern, ignore it
                return false;
            }
            else if (matchWhere.HasValue && match.Index != matchWhere.Value)
            {
                // Matches too late in the string, not our folder
                return false;
            }

            // Get all our path segments. If our filter matches of any them, skip.
            // All these comparisons are case insensitive.
            var path_segments = new List<string>(normalised_path.ToLower().Split('/'));

            if (filter != null && filter.Any(filter_text => path_segments.Contains(filter_text.ToLower())))
            {
                return false;
            }

            if (filter_regexp != null && filter_regexp.Any(regexp => Regex.IsMatch(normalised_path, regexp)))
            {
                return false;
            }

            if (include_only != null && include_only.Any(text => path_segments.Contains(text.ToLower())))
            {
                return true;
            }

            if (include_only_regexp != null && include_only_regexp.Any(regexp => Regex.IsMatch(normalised_path, regexp)))
            {
                return true;
            }

            return include_only == null && include_only_regexp == null;
        }

        public bool TryGetInstallableFile(string           pathInZip,
                                          IArchiveEntry    entry,
                                          IGame            game,
                                          bool             isDirectory,
                                          long             size,
                                          bool             withInternalCkans,
                                          HashSet<string>? filters,
                                          ref int          filteredCount,
                                          [NotNullWhen(true)]
                                          out (string pathInZip, InstallableFile installableFile)? val)
        {
            if (IsWanted(pathInZip, null)
                && (withInternalCkans || !IsInternalCkan(pathInZip)))
            {
                var destination = TransformOutputName(game, pathInZip, InstallDirectory(game), @as);
                if (filters?.Any(filt => destination.Contains(filt)) ?? false)
                {
                    ++filteredCount;
                }
                else
                {
                    val = (pathInZip,
                           new InstallableFile
                           {
                               entry   = entry,
                               relDest = destination,
                               makedir = AllowDirectoryCreation(game, destination),
                               isDir   = isDirectory,
                               size    = size,
                           });
                    return true;
                }
            }
            val = null;
            return false;
        }

        public static bool IsInternalCkan(string? filename)
            => filename?.EndsWith(".ckan", StringComparison.OrdinalIgnoreCase)
                       ?? false;

        public int? MatchLength(string pathInZip)
            => find != null
               && InstallPattern.Match(pathInZip) is { Success: true } match
                   ? match.Index
                   : null;

        private string? installDir = null;

        private string InstallDirectory(IGame game)
            => installDir ??= CKANPathUtils.NormalizePath(install_to ?? "") switch
               {
                   // Updir not allowed
                   string s when s.Contains("/../") || s.EndsWith("/..")
                       => throw new BadInstallLocationKraken(
                              string.Format(Properties.Resources.ModuleInstallDescriptorInvalidInstallPath,
                                            s)),

                   // GameRoot
                   "GameRoot" => "",

                   // GameData
                   string s when s == game.PrimaryModDirectoryRelative => s,

                   // GameData/subdir
                   string s when s.StartsWith($"{game.PrimaryModDirectoryRelative}/")
                       => $"{game.PrimaryModDirectoryRelative}/{s[(game.PrimaryModDirectoryRelative.Length+1)..]}",


                   // Tutorial, Missions, Scenarios, Ships, etc.
                   string s when game.AllowInstallationIn(s, out string? path) => path,

                   _ => throw new BadInstallLocationKraken(
                            string.Format(Properties.Resources.ModuleInstallDescriptorUnknownInstallPath,
                                          install_to)),
               };

        private static bool AllowDirectoryCreation(IGame game, string relativePath)
            => game.CreateableDirs.Any(dir => relativePath == dir
                                           || relativePath.StartsWith($"{dir}/"));

        /// <summary>
        /// Transforms the name of the output. This will strip the leading directories from the stanza file from
        /// output name and then combine it with the installDir.
        /// EX: "kOS-1.1/GameData/kOS", "kOS-1.1/GameData/kOS/Plugins/kOS.dll", "GameData" will be transformed
        /// to "GameData/kOS/Plugins/kOS.dll"
        /// </summary>
        /// <param name="game">The game to use for reserved paths</param>
        /// <param name="outputName">The name of the file to transform</param>
        /// <param name="installDir">The installation dir where the file should end up with</param>
        /// <param name="as">The name to use for the file</param>
        /// <returns>The output name</returns>
        internal string TransformOutputName(IGame?  game,
                                            string  outputName,
                                            string  installDir,
                                            string? @as)
        {
            var leadingPathToRemove = Path.GetDirectoryName(ShortestMatchingPrefix(outputName))
                                          ?.Replace('\\', '/');

            if (!string.IsNullOrEmpty(leadingPathToRemove))
            {
                Regex leadingRE = new Regex(
                    "^" + Regex.Escape(leadingPathToRemove) + "/",
                    RegexOptions.Compiled);
                if (!leadingRE.IsMatch(outputName))
                {
                    throw new BadMetadataKraken(null, string.Format(
                        Properties.Resources.ModuleInstallDescriptorNotMatchingLeadingPath,
                        outputName, leadingPathToRemove));
                }
                // Strip off leading path name
                outputName = leadingRE.Replace(outputName, "");
            }

            // Now outputName looks like PATH/what/ever/file.ext, where
            // PATH is the part that matched `file` or `find` or `find_regexp`

            if (@as != null && !string.IsNullOrWhiteSpace(@as))
            {
                if (@as.Contains("/") || @as.Contains("\\"))
                {
                    throw new BadMetadataKraken(null, Properties.Resources.ModuleInstallDescriptorAsNoPathSeparators);
                }
                // Replace first path component with @as
                outputName = ReplaceFirstPiece(outputName, "/", @as);
            }
            else if (game?.ReservedPaths
                          .FirstOrDefault(prefix => outputName.StartsWith(prefix + "/",
                                                                          StringComparison.InvariantCultureIgnoreCase))
                     is string reservedPrefix)
            {
                // If we try to install a folder with the same name as
                // one of the reserved directories, strip it off.
                // Delete reservedPrefix and one forward slash
                outputName = outputName[(reservedPrefix.Length + 1)..];
            }

            if (outputName.Contains("/../") || outputName.EndsWith("/.."))
            {
                throw new BadInstallLocationKraken(
                    string.Format(Properties.Resources.ModuleInstallDescriptorInvalidInstallPath,
                                  outputName));
            }

            // Return our snipped, normalised, and ready to go output filename!
            return CKANPathUtils.NormalizePath(Path.Combine(installDir, outputName));
        }

        private string ShortestMatchingPrefix(string fullPath)
        {
            var pat = InstallPattern;

            string shortest = fullPath;
            for (var path = trailingSlashPattern.Replace(fullPath.Replace('\\', '/'), "");
                    path != null && !string.IsNullOrEmpty(path);
                    path = Path.GetDirectoryName(path)?.Replace('\\', '/'))
            {
                if (pat.IsMatch(path))
                {
                    shortest = path;
                }
                else
                {
                    break;
                }
            }
            return shortest;
        }

        private static string ReplaceFirstPiece(string text, string delimiter, string replacement)
        {
            int pos = text.IndexOf(delimiter);
            if (pos < 0)
            {
                // No delimiter, replace whole string
                return replacement;
            }
            return replacement + text[pos..];
        }

        public string DescribeMatch()
        {
            StringBuilder sb = new StringBuilder();
            if (!string.IsNullOrEmpty(file))
            {
                sb.AppendFormat("file=\"{0}\"", file);
            }
            if (!string.IsNullOrEmpty(find))
            {
                sb.AppendFormat("find=\"{0}\"", find);
            }
            if (!string.IsNullOrEmpty(find_regexp))
            {
                sb.AppendFormat("find_regexp=\"{0}\"", find_regexp);
            }
            return sb.ToString();
        }
    }
}
