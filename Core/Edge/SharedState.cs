namespace CKAN.Edge
{

    /// <summary>
    /// Provides common references for Edge components
    /// </summary>
    public static class SharedState
    {

        // TODO: The edge components should work even if the network is down
        //       (Right now they hang)

        static SharedState()
        {
            Manager = new GameInstanceManager(new NullUser());
            Manager.GetPreferredInstance();
        }

        public static readonly GameInstanceManager Manager;

        public static Registry Registry
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

        public static NetModuleCache Cache
        {
            get
            {
                return Manager?.Cache;
            }
        }

        public static ModuleInstaller Installer
        {
            get
            {
                return new ModuleInstaller(
                    Manager?.CurrentInstance,
                    Manager?.Cache,
                    new NullUser());
            }
        }

    }
}
