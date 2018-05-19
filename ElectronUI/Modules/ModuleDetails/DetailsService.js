import { func }    from 'electron-edge-js';
import FindCKANDLL from '../../main/FindCKANDLL.js';

export default class DetailsService {
    constructor() {

        var dllPath = FindCKANDLL();

        // Make Edge.js wrappers for the methods of the functions in CKAN.dll
        ['Get', 'GetMoreRelationships', 'GetModuleContents'].forEach(methodName =>
            this[methodName] = func({
                assemblyFile: dllPath,
                typeName:     'CKAN.Edge.ModuleDetails',
                methodName:   methodName
            })
        );
    }

}
