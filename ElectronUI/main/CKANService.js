import { func }    from 'electron-edge-js';
import FindCKANDLL from '../main/FindCKANDLL.js';

export default class CKANService {
    constructor() {

        const dllPath = FindCKANDLL();

        // Make Edge.js wrappers for the methods of the functions in CKAN.dll
        ['Version'].forEach(methodName =>
            this[methodName] = func({
                assemblyFile: dllPath,
                typeName:     'CKAN.Edge.CKAN',
                methodName:   methodName
            })
        );
    }

}
