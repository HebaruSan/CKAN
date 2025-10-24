using Newtonsoft.Json.Linq;
using NUnit.Framework;

using CKAN;
using CKAN.Games.KerbalSpaceProgram;
using CKAN.NetKAN.Validators;
using CKAN.NetKAN.Model;
using Tests.Data;

namespace Tests.NetKAN.Validators
{
    [TestFixture]
    public class PluginsValidatorTests
    {
        [Test]
        public void Validate_PluginModule_Warns()
        {
            // Arrange
            var jobj = new JObject()
            {
                { "identifier", "NotDogeCoinPlugin" },
                { "version",    "1.0"               },
                { "download",   "https://dogecoin.com/download" },
                { "install",    new JArray(new JObject() { { "find", "DogeCoinPlugin" },
                                                           { "install_to", "GameData" } }) },
            };
            var module = jobj.ToObject<CkanModule>()!;
            var game   = new KerbalSpaceProgram();
            var sut    = new PluginsValidator(game);
            using (var appender = new TemporaryWarningCapturer(nameof(PluginsValidator)))
            {
                // Act
                sut.Validate(new Metadata(jobj), module);

                // Assert
                CollectionAssert.AreEqual(
                    new string[]
                    {
                        "No plugin matching the identifier, manual installations won't be detected: GameData/DogeCoinPlugin/Plugins/DogeCoinPlugin.dll",
                        "Unbounded future compatibility for module with a plugin, consider setting $vref or ksp_version or ksp_version_max"
                    },
                    appender.Warnings);
            }
        }
    }
}
