using System;

using SharpCompress.Common;

using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Transformers
{
    internal sealed class InstallSizeTransformer : IContentTransformer
    {
        public string Name => "install_size";

        public void VisitContainedFile(Metadata     metadata,
                                       CkanModule   module,
                                       IEntry       entry,
                                       bool         installing,
                                       Func<string> getContents)
        {
            if (installing)
            {
                size += entry.Size;
            }
        }

        public Metadata Transform(Metadata metadata)
        {
            if (size > 0)
            {
                var json = metadata.Json();
                json["install_size"] = size;
                return new Metadata(json);
            }
            return metadata;
        }

        private long size = 0;
    }
}
