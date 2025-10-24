using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Moq;

using CKAN.NetKAN.Model;
using CKAN.NetKAN.Services;
using CKAN.NetKAN.Transformers;

using Tests.Data;

namespace Tests.NetKAN.Transformers
{
    [TestFixture]
    public sealed class InstallSizeTransformerTests
    {
        [Test]
        public void Transform_NormalModule_CorrectInstallSize()
        {
            // Arrange
            var json = JObject.Parse(TestData.DogeCoinFlag_101());

            var mHttp = new Mock<IHttpService>();
            mHttp.Setup(i => i.DownloadModule(It.IsAny<Metadata>()))
                 .Returns(TestData.DogeCoinFlagZip());

            var sut = new InstallSizeTransformer();

            // Act
            var result = sut.Transform(new Metadata(json));
            var transformedJson = result.Json();

            // Assert
            Assert.AreEqual(52043, (int?)transformedJson["install_size"]);
        }
    }
}
