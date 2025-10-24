using System;
using System.Collections.Generic;

using SharpCompress.Common;

using CKAN.IO;
using CKAN.NetKAN.Model;

namespace CKAN.NetKAN.Validators
{
    internal interface IContentValidator
    {
        void VisitContainedFile(Metadata                             metadata,
                                CkanModule                           module,
                                IEntry                               entry,
                                IReadOnlyCollection<InstallableFile> installsAs,
                                Func<string>                         getContents);

        void Validate(Metadata   metadata,
                      CkanModule module);
    }
}
