using System;

using SharpCompress.Common;

using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Transformers
{
    internal interface IContentTransformer
    {
        string Name { get; }

        void VisitContainedFile(Metadata     metadata,
                                CkanModule   module,
                                IEntry       entry,
                                bool         installing,
                                Func<string> getContents);

        Metadata Transform(Metadata metadata);
    }
}
