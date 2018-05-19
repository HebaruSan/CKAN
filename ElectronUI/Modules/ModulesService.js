import { func }    from 'electron-edge-js';
import FindCKANDLL from '../main/FindCKANDLL.js';

export default class ModulesService {
    constructor() {

        const dllPath = FindCKANDLL();

        // Make Edge.js wrappers for the methods of the functions in CKAN.dll
        ['Available', 'Installed', 'Incompatible', 'Refresh'].forEach(methodName =>
            this[methodName] = func({
                assemblyFile: dllPath,
                typeName:     'CKAN.Edge.Modules',
                methodName:   methodName
            })
        );
    }

}
