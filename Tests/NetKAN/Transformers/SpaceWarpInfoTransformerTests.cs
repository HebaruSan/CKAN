using System;

using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Moq;

using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;
using CKAN.NetKAN.Transformers;
using CKAN.NetKAN.Sources.Github;
using Tests.Data;

namespace Tests.NetKAN.Transformers
{
    [TestFixture]
    public sealed class SpaceWarpInfoTransformerTests
    {
        [Test]
        public void Transform_WithSpaceWarpInfo_Works()
        {
            // Arrange
            var http     = new Mock<IHttpService>();
            http.Setup(h => h.DownloadModule(It.IsAny<Metadata>()))
                .Returns(TestData.DogeCoinFlagZip());
            http.Setup(h => h.DownloadText(It.IsAny<Uri>(),
                                           It.IsAny<string?>(),
                                           It.IsAny<string?>()))
                .Returns(@"{
                             ""name"":        ""Mod with swinfo"",
                             ""author"":      ""Mod author"",
                             ""description"": ""Online copy of the info"",
                             ""version"":     ""1.0.0""
                         }");
            var ghApi    = new Mock<IGithubApi>();
            var loader   = new SpaceWarpInfoLoader(http.Object,
                                                   ghApi.Object);
            var sut      = new SpaceWarpInfoTransformer(loader);
            var opts     = new TransformOptions(1, null, null, null, false, null);
            var metadata = new Metadata(new JObject()
            {
                { "identifier", "SWInfoMod"                   },
                { "$vref",      "#/ckan/space-warp"           },
                { "download",   "https://github.com/download" },
            });

            // Act
            var result          = sut.Transform(metadata);
            var transformedJson = result.Json();

            // Assert
            Assert.AreEqual("Mod with swinfo", (string?)transformedJson?["name"]);
            Assert.AreEqual("Mod author",      (string?)transformedJson?["author"]);
            Assert.AreEqual("Online copy of the info",
                            (string?)transformedJson?["abstract"]);
            Assert.AreEqual("1.0.0",           (string?)transformedJson?["version"]);
        }
    }
}
