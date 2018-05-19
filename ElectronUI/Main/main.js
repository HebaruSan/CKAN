require = require('esm')(module);

const path                            = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev                           = require('electron-is-dev');

const Settings   = require('./Settings.js').default;
const CKANWindow = require('./CKANWindow.js').default;
const TrayIcon   = require('./TrayIcon.js').default;

Object.assign(process.env, {
    // Work around Mono problem: undefined symbol: mono_add_internal_call_with_flags
    LD_PRELOAD: 'libmono-2.0.so libmonosgen-2.0.so libstdc++.so.6',
    // Have Mono print what it's doing
    //MONO_LOG_LEVEL: 'debug',
    /* Not needed, it finds our DLL just fine
    const os = require('os');
    LD_LIBRARY_PATH: path.join(
        os.homedir(), 'Downloads', 'KSP', 'CKAN',
        '_build', 'out', 'CKAN', 'Release', 'bin', 'net45'),
    */
});

let mainWindow;
// TrayIcon can't be created until we open the window
let trayIcon;

ipcMain.handle('isDev', () => isDev);

const settings = new Settings();

function createWindow() {
    mainWindow = new CKANWindow(settings,
                                isDev,
                                MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
                                || path.join(__dirname, 'preload.js'),
                                isDev ? 'http://localhost:3000/main_window'
                                      : (MAIN_WINDOW_WEBPACK_ENTRY
                                         || path.join(__dirname, 'main_window')));
    if (!trayIcon)
        trayIcon = new TrayIcon(settings);
}

// This method will be called when Electron has finished initialization
// and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On OSX it is common for applications and their menu bar to stay active
    // until the user quits explicitly with Cmd+Q
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
