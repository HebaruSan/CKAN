using System.IO;
using System.Linq;

using SharpCompress.Common;
using SharpCompress.Writers;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Moq;

using CKAN.Games.KerbalSpaceProgram;
using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;
using CKAN.NetKAN.Transformers;
using Tests.Data;

namespace Tests.NetKAN.Transformers
{
    [TestFixture]
    public class LocalizationsTransformerTests
    {
        [Test]
        public void Transform_WithLocalizationsCfg_GeneratesProperty()
        {
            // Arrange
            var opts   = new TransformOptions(1, null, null, null, false, null);
            var jobj   = new JObject()
            {
                { "identifier", "LocalizedMod" },
                { "version",    "1.0" },
                { "download",   "https://localizedmod.com/download" },
            };
            using (var dir = new TemporaryDirectory())
            {
                var cfgPath = Path.Combine(dir, "lang.cfg");
                File.WriteAllLines(cfgPath,
                                   new string[]
                                   {
                                       "Localization",
                                       "{",
                                       "    en-us",
                                       "    {",
                                       "        key = val",
                                       "    }",
                                       "",
                                       "    es-es",
                                       "    {",
                                       "        key = val",
                                       "    }",
                                       "}",
                                       "",
                                       "Localization",
                                       "{",
                                       "    de-de",
                                       "    {",
                                       "        key = val",
                                       "    }",
                                       "}",
                                       "",
                                   });
                var zipPath = Path.Combine(dir, "mod.zip");
                using (var stream = File.OpenWrite(zipPath))
                using (var writer = WriterFactory.Open(stream, ArchiveType.Zip,
                                                       new WriterOptions(CompressionType.Deflate)))
                {
                    writer.Write("LocalizedMod/lang.cfg", new FileInfo(cfgPath));
                }
                var http    = new Mock<IHttpService>();
                http.Setup(h => h.DownloadModule(It.IsAny<Metadata>()))
                    .Returns(zipPath);
                var game    = new KerbalSpaceProgram();
                var sut     = new LocalizationsTransformer();

                // Act
                var result = sut.Transform(new Metadata(jobj));

                // Assert
                Assert.IsTrue(result.AllJson.ContainsKey("localizations"));
                CollectionAssert.AreEqual(new string[] { "de-de", "en-us", "es-es" },
                                          result.AllJson["localizations"]!
                                                .OfType<JValue>()
                                                .Select(jv => (string?)jv)
                                                .OfType<string>());
            }
        }
    }
}
