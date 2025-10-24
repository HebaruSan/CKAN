using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Moq;

using CKAN;
using CKAN.NetKAN.Validators;
using CKAN.Games.KerbalSpaceProgram;
using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;
using Tests.Data;

namespace Tests.NetKAN.Validators
{
    [TestFixture]
    public class SpaceWarpInfoValidatorTests
    {
        [Test]
        public void Validate_WithMismatchedDeps_Warns()
        {
            // Arrange
            var game = new KerbalSpaceProgram();
            var loader = new Mock<ISpaceWarpInfoLoader>();
            var sut  = new SpaceWarpInfoValidator(loader.Object);
            var metadata = new Metadata(new JObject()
            {
                { "identifier", "TestMod"                     },
                { "name",       "Test Mod"                    },
                { "version",    "1.0"                         },
                { "download",   "https://github.com/download" },
                { "depends",    new JArray(new JObject() { { "name", "Present1" } },
                                           new JObject() { { "name", "Present2" } },
                                           new JObject() { { "name", "Present3" } }) },
            });
            var module = metadata.AllJson.ToObject<CkanModule>()!;
            using (var appender = new TemporaryWarningCapturer(nameof(SpaceWarpInfoValidator)))
            {
                // Act
                sut.Validate(metadata, module);

                // Assert
                CollectionAssert.AreEquivalent(
                    new string[]
                    {
                        "Dependencies from swinfo.json missing from module: Missing1, With.Name.Space.Prefix.Missing2, missing3"
                    },
                    appender.Warnings);
            }
        }
    }
}
