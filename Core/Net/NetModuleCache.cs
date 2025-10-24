using System;
using System.Linq;
using System.IO;
using System.Threading;
using System.Collections.Generic;

using CKAN.IO;
using CKAN.Configuration;
using CKAN.Extensions;

namespace CKAN
{
    /// <summary>
    /// A cache object that protects the validity of the files it contains.
    /// A CkanModule must be provided for each file added, and the following
    /// properties are checked before adding:
    ///   - CkanModule.download_size
    ///   - CkanModule.download_hash.sha1
    ///   - CkanModule.download_hash.sha256
    /// </summary>
    public class NetModuleCache : IDisposable
    {
        static NetModuleCache()
        {
        }

        /// <summary>
        /// Initialize the cache
        /// </summary>
        /// <param name="mgr">GameInstanceManager containing instances that might have legacy caches</param>
        /// <param name="path">Path to directory to use as the cache</param>
        public NetModuleCache(GameInstanceManager mgr, string path)
        {
            cache = new NetFileCache(mgr, path);
        }

        /// <summary>
        /// Initialize the cache
        /// </summary>
        /// <param name="path">Path to directory to use as the cache</param>
        public NetModuleCache(string path)
        {
            cache = new NetFileCache(path);
        }

        public event Action<CkanModule>?  ModStored;
        public event Action<CkanModule?>? ModPurged;

        // Simple passthrough wrappers
        public void Dispose()
        {
            cache.Dispose();
            GC.SuppressFinalize(this);
        }
        public void RemoveAll()
        {
            cache.RemoveAll();
            ModPurged?.Invoke(null);
        }
        public void MoveFrom(DirectoryInfo fromDir, IProgress<int> progress)
        {
            cache.MoveFrom(fromDir, progress);
        }
        public bool IsCached(CkanModule m)
            => m.download?.Any(cache.IsCached)
                ?? false;
        public bool IsMaybeCachedZip(CkanModule m)
            => m.download?.Any(dlUri => cache.IsMaybeCachedZip(dlUri, m.release_date))
                ?? false;
        public string? GetCachedFilename(CkanModule m)
            => m.download?.Select(dlUri => cache.GetCachedFilename(dlUri, m.release_date))
                          .FirstOrDefault(filename => filename != null);
        public void GetSizeInfo(out int numFiles, out long numBytes, out long? bytesFree)
        {
            cache.GetSizeInfo(out numFiles, out numBytes, out bytesFree);
        }
        public void EnforceSizeLimit(long bytes, Registry registry)
        {
            cache.EnforceSizeLimit(bytes, registry);
        }
        public void CheckFreeSpace(long bytesToStore)
        {
            cache.CheckFreeSpace(bytesToStore);
        }

        public FileInfo? GetInProgressFileName(CkanModule m)
            => m.download == null
                ? null
                : cache.GetInProgressFileName(m.download, m.StandardName());

        private static string DescribeUncachedAvailability(IConfiguration config,
                                                           CkanModule     m,
                                                           FileInfo?      fi)
            => (fi?.Exists ?? false)
                ? string.Format(Properties.Resources.NetModuleCacheModuleResuming,
                    m.name, m.version,
                    string.Join(", ", ModuleInstaller.PrioritizedHosts(config, m.download)),
                    CkanModule.FmtSize(m.download_size - fi.Length))
                : string.Format(Properties.Resources.NetModuleCacheModuleHostSize,
                    m.name, m.version,
                    string.Join(", ", ModuleInstaller.PrioritizedHosts(config, m.download)),
                    CkanModule.FmtSize(m.download_size));

        public string DescribeAvailability(IConfiguration config, CkanModule m)
            => m.IsMetapackage
                ? string.Format(Properties.Resources.NetModuleCacheMetapackage, m.name, m.version)
                : IsMaybeCachedZip(m)
                    ? string.Format(Properties.Resources.NetModuleCacheModuleCached, m.name, m.version)
                    : DescribeUncachedAvailability(config, m, GetInProgressFileName(m));

        /// <summary>
        /// Calculate the SHA1 hash of a file
        /// </summary>
        /// <param name="filePath">Path to file to examine</param>
        /// <param name="progress">Callback to notify as we traverse the input, called with percentages from 0 to 100</param>
        /// <param name="cancelToken">Cancellation token to cancel the operation</param>
        /// <returns>
        /// SHA1 hash, in all-caps hexadecimal format
        /// </returns>
        public string GetFileHashSha1(string filePath, IProgress<int> progress, CancellationToken? cancelToken = default)
            => cache.GetFileHashSha1(filePath, progress, cancelToken);

        /// <summary>
        /// Calculate the SHA256 hash of a file
        /// </summary>
        /// <param name="filePath">Path to file to examine</param>
        /// <param name="progress">Callback to notify as we traverse the input, called with percentages from 0 to 100</param>
        /// <param name="cancelToken">Cancellation token to cancel the operation</param>
        /// <returns>
        /// SHA256 hash, in all-caps hexadecimal format
        /// </returns>
        public string GetFileHashSha256(string filePath, IProgress<int> progress, CancellationToken? cancelToken = default)
            => cache.GetFileHashSha256(filePath, progress, cancelToken);

        /// <summary>
        /// Try to add a file to the module cache.
        /// Throws exceptions if the file doesn't match the metadata.
        /// </summary>
        /// <param name="module">The module object corresponding to the download</param>
        /// <param name="path">Path to the file to add</param>
        /// <param name="progress">Callback to notify as we traverse the input, called with byte counts</param>
        /// <param name="description">Description of the file</param>
        /// <param name="move">True to move the file, false to copy</param>
        /// <param name="cancelToken">Cancellation token to cancel the operation</param>
        /// <param name="validate">True to validate the file, false to skip validation</param>
        /// <returns>
        /// Name of the new file in the cache
        /// </returns>
        public string Store(CkanModule         module,
                            string             path,
                            IProgress<long>?   progress,
                            string?            description = null,
                            bool               move        = false,
                            CancellationToken? cancelToken = default,
                            bool               validate    = true)
        {
            if (validate)
            {
                progress?.Report(0);
                // Check file exists
                FileInfo fi = new FileInfo(path);
                if (!fi.Exists)
                {
                    throw new FileNotFoundKraken(path);
                }

                // Check file size
                if (module.download_size > 0 && fi.Length != module.download_size)
                {
                    throw new InvalidModuleFileKraken(module, path, string.Format(
                        Properties.Resources.NetModuleCacheBadLength,
                        module, path, fi.Length, module.download_size));
                }

                cancelToken?.ThrowIfCancellationRequested();

                // Check valid CRC
                if (!ZipValid(path, out string invalidReason, progress, cancelToken))
                {
                    throw new InvalidModuleFileKraken(
                        module, path,
                        string.Format(Properties.Resources.NetModuleCacheNotValidZIP,
                                      module, path, invalidReason));
                }

                cancelToken?.ThrowIfCancellationRequested();
            }
            // If no exceptions, then everything is fine
            var success = //module.download is [Uri url, ..]
                          module.download != null
                          && module.download.Count > 0
                          && module.download[0] is Uri url
                            ? cache.Store(url, path,
                                          description ?? module.StandardName(),
                                          move)
                            : "";
            // Make sure completion is signalled so progress bars go away
            progress?.Report(new FileInfo(path).Length);
            ModStored?.Invoke(module);
            return success;
        }

        /// <summary>
        /// Check whether a ZIP file is valid
        /// </summary>
        /// <param name="filename">Path to zip file to check</param>
        /// <param name="invalidReason">Description of problem with the file</param>
        /// <param name="progress">Callback to notify as we traverse the input, called with byte counts</param>
        /// <param name="cancelToken">Cancellation token to cancel the operation</param>
        /// <returns>
        /// True if valid, false otherwise. See invalidReason param for explanation.
        /// </returns>
        public static bool ZipValid(string             filename,
                                    out string         invalidReason,
                                    IProgress<long>?   progress,
                                    CancellationToken? cancelToken = default)
        => File.OpenRead(filename)
               .TestArchive(out invalidReason, progress, cancelToken);

        /// <summary>
        /// Remove a module's download files from the cache
        /// </summary>
        /// <param name="module">Module to purge</param>
        /// <returns>
        /// True if all purged, false otherwise
        /// </returns>
        public bool Purge(CkanModule module)
        {
            if (module.download != null
                && cache.Remove(module.download))
            {
                ModPurged?.Invoke(module);
                return true;
            }
            return false;
        }

        public bool Purge(IReadOnlyCollection<CkanModule> modules)
        {
            if (modules.Select(m => cache.Remove(m.download ?? Enumerable.Empty<Uri>()))
                       .ToArray()
                       .Any(removed => removed))
            {
                ModPurged?.Invoke(modules.First());
                return true;
            }
            return false;
        }

        public IReadOnlyDictionary<string, long> CachedFileSizeByHost(IReadOnlyDictionary<string, Uri> hashToURL)
            => cache.CachedHashesAndSizes()
                    // Skip downloads that changed URLs after downloading
                    .Where(tuple => hashToURL.ContainsKey(tuple.hash))
                    .GroupBy(tuple => hashToURL[tuple.hash].Host,
                             tuple => tuple.size)
                    .ToDictionary(grp => grp.Key,
                                  grp => grp.Sum());

        private readonly NetFileCache cache;
    }
}
