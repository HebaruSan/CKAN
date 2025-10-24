using System.IO;

using SharpCompress.Writers;
using SharpCompress.Common;
using NUnit.Framework;

using CKAN;
using CKAN.IO;

using Tests.Data;

namespace Tests.Core.IO
{
    [TestFixture]
    public class FileIdentifierTests
    {
        [Test]
        public void IdentifyFile_ASCII_Works()
        {
            // Check that we have the text files to compare against.
            string ascii_file_1 = TestData.DataFile("FileIdentifier/test_ascii.txt");
            string ascii_file_2 = TestData.DataFile("FileIdentifier/test_ascii.tmp");

            FileAssert.Exists(ascii_file_1);
            FileAssert.Exists(ascii_file_2);

            // Check that both files return a tar type.
            Assert.AreEqual(FileType.ASCII, FileIdentifier.IdentifyFile(ascii_file_1));
            Assert.AreEqual(FileType.ASCII, FileIdentifier.IdentifyFile(ascii_file_2));
        }

        [Test]
        public void IdentifyFile_Tar_Works()
        {
            // Check that we have the tar files to compare against.
            string tar_file_1 = TestData.DataFile("FileIdentifier/test_tar.tar");
            string tar_file_2 = TestData.DataFile("FileIdentifier/test_tar.tmp");

            FileAssert.Exists(tar_file_1);
            FileAssert.Exists(tar_file_2);

            // Check that both files return a tar type.
            Assert.AreEqual(FileType.Tar, FileIdentifier.IdentifyFile(tar_file_1));
            Assert.AreEqual(FileType.Tar, FileIdentifier.IdentifyFile(tar_file_2));
        }

        [Test]
        public void IdentifyFile_EmptyTar_Works()
        {
            // Arrange / Act
            var path = Path.GetTempFileName();
            using (var outputStream = File.OpenWrite(path))
            using (var writer = WriterFactory.Open(outputStream, ArchiveType.Tar,
                                                   new WriterOptions(CompressionType.None)
                                                   {
                                                       LeaveStreamOpen = true
                                                   }))
            {
            }

            // Assert
            try
            {
                Assert.AreEqual(FileType.Tar, FileIdentifier.IdentifyFile(path));
            }
            finally
            {
                File.Delete(path);
            }
        }

        [Test]
        public void IdentifyFile_TarGz_Works()
        {
            // Check that we have the tar.gz files to compare against.
            string targz_file_1 = TestData.DataFile("FileIdentifier/test_targz.tar.gz");
            string targz_file_2 = TestData.DataFile("FileIdentifier/test_targz.tmp");

            FileAssert.Exists(targz_file_1);
            FileAssert.Exists(targz_file_2);

            // Check that both files return a tar.gz type.
            Assert.AreEqual(FileType.TarGz, FileIdentifier.IdentifyFile(targz_file_1));
            Assert.AreEqual(FileType.TarGz, FileIdentifier.IdentifyFile(targz_file_2));
        }

        [Test]
        public void IdentifyFile_EmptyTarGz_Works()
        {
            // Arrange / Act
            var path = Path.GetTempFileName();
            using (var outputStream = File.OpenWrite(path))
            using (var writer = WriterFactory.Open(outputStream, ArchiveType.Tar,
                                                   new WriterOptions(CompressionType.GZip)
                                                   {
                                                       LeaveStreamOpen = true
                                                   }))
            {
            }

            // Assert
            try
            {
                Assert.AreEqual(FileType.TarGz, FileIdentifier.IdentifyFile(path));
            }
            finally
            {
                File.Delete(path);
            }
        }

        [Test]
        public void IdentifyFile_Zip_Works()
        {
            // Check that we have the zip files to compare against.
            string zip_file_1 = TestData.DataFile("FileIdentifier/test_zip.zip");
            string zip_file_2 = TestData.DataFile("FileIdentifier/test_zip.tmp");

            FileAssert.Exists(zip_file_1);
            FileAssert.Exists(zip_file_2);

            // Check that both files return a zip type.
            Assert.AreEqual(FileType.Zip, FileIdentifier.IdentifyFile(zip_file_1));
            Assert.AreEqual(FileType.Zip, FileIdentifier.IdentifyFile(zip_file_2));
        }
    }
}
