require = require('esm')(module);
const path                           = require('path');
const { contextBridge, ipcRenderer } = require('electron');
const { func }                       = require('electron-edge-js');

contextBridge.exposeInMainWorld('main', Object.fromEntries([
    // From renderer to main, unidirectional
    ...['toggleDevTools', 'closeDevTools', 'minimize', 'maximize', 'close']
        .map(msg => ([msg, () => ipcRenderer.send(msg)])),
    // From renderer to main, bidirectional (with return values via .handle)
    ...['isDev', 'showOpenDialog', 'getSettings', 'setSetting', 'isMaximized']
        .map(msg => ([msg, (...args) => ipcRenderer.invoke(msg, ...args)])),
    // From main to renderer via callbacks
    ...['onMaximized']
        .map(msg => ([msg, /** @param {function(Electron.IpcRendererEvent, ...any[]): void} callback */
                           callback => ipcRenderer.on(msg, callback)])),
]));

// From renderer to DLL
const assemblyFile = path.join(__dirname, 'bin', 'CKAN.dll');
func('cs', {assemblyFile, typeName:   'CKAN.Edge.Edge',
                          methodName: 'Catalog'})({}, (error, catalog) => {
    if (error)
        console.log(`Failed to retrieve Edge catalog from DLL: ${error}`);
    else
        /**
         * @param {string} className
         * @param {string} typeName
         * @param {string[]} methodNames
         */
        catalog.forEach(({className, typeName, methodNames}) =>
            contextBridge.exposeInMainWorld(
                className,
                Object.fromEntries(methodNames.map(
                    /** @param {string} methodName */
                    methodName => [methodName, func('cs', {assemblyFile,
                                                           typeName, methodName})]))));
});
