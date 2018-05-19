namespace CKAN.Edge
{

    /// <summary>
    /// Provides common references for Edge components
    /// </summary>
    public static class SharedState
    {

        static SharedState()
        {
            Manager = new KSPManager(new NullUser());
            Manager.GetPreferredInstance();
        }

        public static readonly KSPManager      Manager;

        public static          Registry        Registry
        {
            get
            {
                try
                {
                    return Manager?.CurrentInstance == null
                        ? null
                        : RegistryManager.Instance(Manager.CurrentInstance).registry;
                }
                catch
                {
                    // Reject this instance
                    Manager.CurrentInstance = null;
                    throw;
                }
            }
        }

        public static          NetModuleCache  Cache
        {
            get
            {
                return Manager?.Cache;
            }
        }

        public static          ModuleInstaller Installer
        {
            get
            {
                return ModuleInstaller.GetInstance(
                    Manager?.CurrentInstance,
                    Manager?.Cache,
                    new NullUser()
                );
            }
        }

    }
}
