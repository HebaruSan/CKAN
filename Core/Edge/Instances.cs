using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using CKAN.Games;

namespace CKAN.Edge
{
    public class Instances
    {

        public async Task<object> Get(dynamic input)
            => await Task.Run(() => SharedState.Manager.Instances.Values
                .OrderByDescending(inst => inst.Version())
                .Select(inst => new
                {
                    Name    = inst.Name,
                    Game    = inst.game.ShortName,
                    Version = inst.Version()?.ToString(),
                    Valid   = inst.Valid,
                    Default = inst.Name == SharedState.Manager.AutoStartInstance,
                    Current = inst.Name == SharedState.Manager.CurrentInstance?.Name,
                    // Display paths in local system format
                    Path    = inst.GameDir().Replace(Path.AltDirectorySeparatorChar, Path.DirectorySeparatorChar)
                })
                .ToArray());

        public async Task<object> Remove(dynamic input)
        {
            SharedState.Manager.RemoveInstance(input as string);
            return await Get(input);
        }

        public async Task<object> SetDefault(dynamic input)
        {
            string name = input as string;
            if (string.IsNullOrEmpty(name))
            {
                SharedState.Manager.ClearAutoStart();
            }
            else
            {
                SharedState.Manager.SetAutoStart(name);
            }
            return await Get(input);
        }

        public async Task<object> SetCurrent(dynamic input)
        {
            string name = input as string;
            SharedState.Manager.SetCurrentInstance(name);
            return await Get(input);
        }

        public async Task<object> Add(dynamic input)
        {
            SharedState.Manager.AddInstance(new GameInstance(new KerbalSpaceProgram(), input.path, input.name, SharedState.Manager.User));
            return await Get(input);
        }

        public async Task<object> Rename(dynamic input)
        {
            SharedState.Manager.RenameInstance(input.fromName, input.toName);
            return await Get(input);
        }

        public async Task ReleaseLock(dynamic input)
        {
            RegistryManager.Instance(SharedState.Manager.CurrentInstance).ReleaseLock();
        }

    }
}
