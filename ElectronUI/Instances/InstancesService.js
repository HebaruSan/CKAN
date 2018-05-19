import { func }    from 'electron-edge-js';
import FindCKANDLL from '../main/FindCKANDLL.js';

export default class InstancesService {
    constructor() {

        const dllPath = FindCKANDLL();

        // Make Edge.js wrappers for the methods of the functions in CKAN.dll
        ['Get', 'Remove', 'SetDefault', 'SetCurrent', 'Add', 'Rename'].forEach(methodName =>
            this[methodName] = func({
                assemblyFile: dllPath,
                typeName:     'CKAN.Edge.Instances',
                methodName:   methodName
            })
        );
    }

}
