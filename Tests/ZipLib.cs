using System.IO;
using System.Linq;

using SharpCompress.Archives;
using NUnit.Framework;

namespace Tests.Data
{
    [TestFixture]
    public class ZipLib
    {
        [Test]
        public void GH221()
        {
            // This is a perfectly fine file, written by 'file-roller', but
            // SharpZipLib can choke on it because it's not properly handling
            // the headers. See GH #221.
            // Less relevant now that we use SharpCompress instead.
            string file = Path.Combine(TestData.DataDir, "gh221.zip");

            var archive = ArchiveFactory.Open(file);

            var entry = archive.Entries.Single(entry => entry.Key == "221.txt");

            Assert.DoesNotThrow(delegate
            {
                entry.OpenEntryStream();
            });
        }
    }
}
