using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace CKAN.Edge
{
    public class Edge
    {
        private static readonly Type   myType      = typeof(Edge);
        private static readonly string myNamespace = myType.Namespace;

        public async Task<object> Catalog(dynamic input)
            => await Task.Run(() =>
                Assembly.GetExecutingAssembly().DefinedTypes
                    .Where(t => t.IsPublic
                                && t.Namespace == myNamespace
                                && t != myType
                                && t.DeclaredMethods.Any(m => m.IsPublic
                                                              && !m.IsStatic))
                    .Select(t => new
                    {
                        className   = t.Name,
                        typeName    = t.FullName,
                        methodNames = t.DeclaredMethods.Where(m => m.IsPublic
                                                                   && !m.IsStatic)
                                                       .Select(m => m.Name)
                                                       .ToArray(),
                    })
                    .ToArray());
    }
}
