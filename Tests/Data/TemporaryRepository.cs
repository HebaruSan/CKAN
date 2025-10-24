using System;
using System.IO;
using System.Text;

using SharpCompress.Writers;
using SharpCompress.Common;

using CKAN;

namespace Tests.Data
{
    /// <summary>
    /// A disposable repository backed by an auto-created tar.gz file
    /// containing the given modules.
    /// Will be automatically cleaned up on falling out of using() scope.
    /// </summary>
    public class TemporaryRepository : IDisposable
    {
        public TemporaryRepository(int priority, params string[] fileContents)
        {
            path = Path.GetTempFileName();
            repo = new Repository("temp", path, priority);

            using (var outputStream = File.OpenWrite(path))
            using (var writer       = WriterFactory.Open(outputStream, ArchiveType.Tar,
                                                         new WriterOptions(CompressionType.GZip)
                                                         {
                                                             LeaveStreamOpen = true
                                                         }))
            {
                int i = 0;
                foreach (var contents in fileContents)
                {
                    writer.Write($"{++i}.ckan", new MemoryStream(Encoding.UTF8.GetBytes(contents)) { Position = 0 });
                }
            }
        }

        public TemporaryRepository(params string[] fileContents)
            : this(0, fileContents)
        { }

        public          Uri        uri  => new Uri(path);
        public readonly Repository repo;

        public void Dispose()
        {
            File.Delete(path);
        }

        private readonly string path;
    }
}
