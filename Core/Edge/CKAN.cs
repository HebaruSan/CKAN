using System.Threading.Tasks;

namespace CKAN.Edge
{
    public class CKAN
    {
        public async Task<object> Version(dynamic input)
        {
            return await Task.Run(() => Meta.GetVersion());
        }
    }
}
