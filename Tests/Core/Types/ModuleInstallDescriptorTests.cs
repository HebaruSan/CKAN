using System.IO;
using System.Linq;

using SharpCompress.Common;
using SharpCompress.Archives;
using SharpCompress.Writers;
using Newtonsoft.Json;
using NUnit.Framework;

using CKAN;
using CKAN.IO;
using CKAN.Games.KerbalSpaceProgram;
using Tests.Data;

namespace Tests.Core.Types
{
    [TestFixture]
    public class ModuleInstallDescriptorTests
    {
        [TestCase("GameData/kOS", "GameData/kOS/Plugins/kOS.dll", "GameData", null, "GameData/kOS/Plugins/kOS.dll")]
        [TestCase("kOS-1.1/GameData/kOS", "kOS-1.1/GameData/kOS/Plugins/kOS.dll", "GameData", null, "GameData/kOS/Plugins/kOS.dll")]
        [TestCase("ModuleManager.2.5.1.dll", "ModuleManager.2.5.1.dll", "GameData", null, "GameData/ModuleManager.2.5.1.dll")]


        [TestCase("Ships", "Ships/SPH/FAR Firehound.craft", "SomeDir/Ships", null, "SomeDir/Ships/SPH/FAR Firehound.craft")]


        [TestCase("GameData/kOS", "GameData/kOS/Plugins/kOS.dll", "GameData", "kOS-Renamed", "GameData/kOS-Renamed/Plugins/kOS.dll")]
        [TestCase("kOS-1.1/GameData/kOS", "kOS-1.1/GameData/kOS/Plugins/kOS.dll", "GameData", "kOS-Renamed", "GameData/kOS-Renamed/Plugins/kOS.dll")]
        [TestCase("ModuleManager.2.5.1.dll", "ModuleManager.2.5.1.dll", "GameData", "ModuleManager-Renamed.dll", "GameData/ModuleManager-Renamed.dll")]
        [TestCase("GameData", "GameData/kOS/Plugins/kOS.dll", "GameData", "GameData-Renamed", "GameData/GameData-Renamed/kOS/Plugins/kOS.dll")]
        [TestCase("Ships", "Ships/SPH/FAR Firehound.craft", "SomeDir/Ships", "Ships-Renamed", "SomeDir/Ships/Ships-Renamed/SPH/FAR Firehound.craft")]
        public void TransformOutputName(string file, string outputName, string installDir, string @as, string expected)
        {
            // Arrange
            var stanza = JsonConvert.DeserializeObject<ModuleInstallDescriptor>(
                $"{{\"file\": \"{file}\"}}");

            // Act
            var result = stanza?.TransformOutputName(new KerbalSpaceProgram(), outputName, installDir, @as);

            // Assert
            Assert.That(result, Is.EqualTo(expected));
        }

        [TestCase("GameData/kOS", "GameData/kOS/Plugins/kOS.dll", "GameData", "kOS/Renamed")]
        [TestCase("kOS-1.1/GameData/kOS", "kOS-1.1/GameData/kOS/Plugins/kOS.dll", "GameData", "kOS/Renamed")]
        [TestCase("ModuleManager.2.5.1.dll", "ModuleManager.2.5.1.dll", "GameData", "Renamed/ModuleManager.dll")]
        public void TransformOutputNameThrowsOnInvalidParameters(string file, string outputName, string installDir, string @as)
        {
            // Arrange
            var stanza = JsonConvert.DeserializeObject<ModuleInstallDescriptor>(
                $"{{\"file\": \"{file}\"}}");

            // Act
            TestDelegate act = () => stanza?.TransformOutputName(new KerbalSpaceProgram(), outputName, installDir, @as);

            // Assert
            Assert.That(act, Throws.Exception);
        }

        [Test]
        public void DefaultInstallStanza_KSP1_GameData()
        {
            // Arrange
            var game = new KerbalSpaceProgram();
            var stanza = ModuleInstallDescriptor.DefaultInstallStanza(game, "DogeCoinFlag");
            // Same again, but screwing up the case (we see this *all the time*)
            var stanza2 = ModuleInstallDescriptor.DefaultInstallStanza(game, "DogecoinFlag");

            // Assert
            Assert.AreEqual("GameData",     stanza.install_to);
            Assert.AreEqual("DogeCoinFlag", stanza.find);
            Assert.AreEqual("GameData",     stanza2.install_to);
            Assert.AreEqual("DogecoinFlag", stanza2.find);
        }

        [TestCase("Ships")]
        [TestCase("Ships/VAB")]
        [TestCase("Ships/SPH")]
        [TestCase("Ships/@thumbs")]
        [TestCase("Ships/@thumbs/VAB")]
        [TestCase("Ships/@thumbs/SPH")]
        [TestCase("Ships/Script")]
        public void AllowsInstallsToShipsDirectories(string directory)
        {
            // Arrange
            using (var stream = new MemoryStream())
            using (var writer = WriterFactory.Open(stream, ArchiveType.Zip,
                                                   new WriterOptions(CompressionType.Deflate)))
            {
                writer.Write("ExampleShips/AwesomeShip.craft", "");

                var mod = CkanModule.FromJson(string.Format(
                    @"{{
                        ""spec_version"": 1,
                        ""identifier"": ""AwesomeMod"",
                        ""author"": ""AwesomeModder"",
                        ""version"": ""1.0.0"",
                        ""download"": ""https://awesomemod.example/AwesomeMod.zip"",
                        ""install"": [
                            {{
                                ""file"": ""ExampleShips/AwesomeShip.craft"",
                                ""install_to"": ""{0}""
                            }}
                        ]
                    }}",
                    directory));

                using (var inst = new DisposableKSP())
                using (var archive = ArchiveFactory.Open(stream))
                {
                    // Act
                    int filterCount = 0;
                    var results = archive.Entries.SelectMany(entry =>
                                          mod.install!
                                             .Select(i => i.TryGetInstallableFile(entry.Key!,
                                                                                  entry, inst.KSP.Game,
                                                                                  entry.IsDirectory, entry.Size,
                                                                                  true, null, ref filterCount,
                                                                                  out (string pathInZip, InstallableFile installableFile)? val)
                                                              ? val : null)
                                             .OfType<(string pathInZip, InstallableFile installableFile)>())
                                         .ToArray();

                    // Assert
                    CollectionAssert.AreEquivalent(
                        new string[]
                        {
                            $"{directory}/AwesomeShip.craft",
                        },
                        results.Select(f => f.installableFile.relDest));
                }
            }
        }

        // TODO: It would be nice to merge this and the above function into one super
        // test.
        [Test]
        public void AllowInstallsToScenarios()
        {
            // Arrange
            // Bogus zip with example to install.
            using (var stream = new MemoryStream())
            using (var writer = WriterFactory.Open(stream, ArchiveType.Zip, new WriterOptions(CompressionType.Deflate)))
            {
                writer.Write("saves/scenarios/AwesomeRace.sfs", "");

                var mod = CkanModule.FromJson(@"
                    {
                        ""spec_version"": ""v1.14"",
                        ""identifier"": ""AwesomeMod"",
                        ""author"": ""AwesomeModder"",
                        ""version"": ""1.0.0"",
                        ""download"": ""https://awesomemod.example/AwesomeMod.zip"",
                        ""install"": [
                            {
                                ""file"": ""saves/scenarios/AwesomeRace.sfs"",
                                ""install_to"": ""Scenarios""
                            }
                        ]
                    }");

                using (var inst = new DisposableKSP())
                using (var archive = ArchiveFactory.Open(stream))
                {
                    int filterCount = 0;
                    // Act
                    var results = archive.Entries.SelectMany(entry =>
                                          mod.install!
                                             .Select(i => i.TryGetInstallableFile(entry.Key!,
                                                                                  entry, inst.KSP.Game,
                                                                                  entry.IsDirectory, entry.Size,
                                                                                  true, null, ref filterCount,
                                                                                  out (string pathInZip, InstallableFile installableFile)? val)
                                                              ? val : null)
                                             .OfType<(string pathInZip, InstallableFile installableFile)>())
                                         .ToArray();

                    // Assert
                    CollectionAssert.AreEquivalent(
                        new string[]
                        {
                            "saves/scenarios/AwesomeRace.sfs",
                        },
                        results.Select(f => f.installableFile.relDest));
                }
            }
        }
    }
}
