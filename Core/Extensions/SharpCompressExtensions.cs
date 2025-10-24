using System;
using System.IO;
using System.IO.Hashing;
using System.Threading;

using SharpCompress.Readers;

namespace CKAN.Extensions
{
    public static class SharpCompressExtensions
    {
        public static bool TestArchive(this Stream        stream,
                                       out string         invalidReason,
                                       IProgress<long>?   progress,
                                       CancellationToken? cancelToken = default)
        {
            using (stream)
            using (var progStream = new ReadProgressStream(stream, progress))
            using (var reader     = ReaderFactory.Open(progStream,
                                                       new ReaderOptions
                                                       {
                                                           LeaveStreamOpen = true
                                                       }))
            {
                var crc = new Crc32();
                while (reader.MoveToNextEntry())
                {
                    cancelToken?.ThrowIfCancellationRequested();
                    if (!reader.Entry.IsDirectory)
                    {
                        crc.Reset();
                        crc.Append(reader.OpenEntryStream());
                        if (crc.GetCurrentHashAsUInt32() != reader.Entry.Crc)
                        {
                            invalidReason = string.Format("CRC mismatch for {0}",
                                                          reader.Entry.Key);
                            return false;
                        }
                    }
                }
                invalidReason = "";
                return true;
            }
        }
    }
}
