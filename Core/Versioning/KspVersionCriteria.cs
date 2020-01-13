using System;
using System.Collections.Generic;
using System.Linq;

namespace CKAN.Versioning
{
    public class KspVersionCriteria
    {
        private List<KspVersion> _versions = new List<KspVersion>();

        public KspVersionCriteria(KspVersion v)
        {
            if (v != null)
            {
                this._versions.Add(v);
            }
        }

        public KspVersionCriteria(KspVersion v, List<KspVersion> compatibleVersions)
        {
            if (v != null)
            {
                this._versions.Add(v);
            }
            this._versions.AddRange(compatibleVersions);
            this._versions = this._versions.Distinct().ToList();
        }

        public IList<KspVersion> Versions
        {
            get
            {
                return _versions.AsReadOnly();
            }
        }

        public KspVersionCriteria Union(KspVersionCriteria other)
        {
            return new KspVersionCriteria(
                null,
                _versions.Union(other.Versions).ToList()
            );
        }

        public override bool Equals(object obj)
        {
            KspVersionCriteria other = obj as KspVersionCriteria;
            if (obj == null)
            {
                return false;
            }
            else
            {
                return !_versions.Except(other._versions).Any()
                    && !other._versions.Except(_versions).Any();
            }
            return true;
        }

        public override String ToString()
        {
            List<String> versionList = new List<String>();
            foreach (KspVersion version in _versions)
            {
                versionList.Add(version.ToString());
            }
            return "[Versions: " + String.Join( ", ", versionList) + "]";
        }
    }
}
