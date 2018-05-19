import { BrowserWindow, ipcMain, dialog } from 'electron';
import winStateKeeper                     from 'electron-window-state';

/**
 * @typedef {import('./Settings.js').default} Settings
 */

/**
 * A class that encapsulates everything the CKAN window does.
 * Excludes stuff like changing the settings (see main)
 * and the tray icon.
 */
export default class CKANWindow extends BrowserWindow {

    /**
     * @param {Settings} settings
     * @param {boolean} isDev
     * @param {string} preloadScript
     * @param {string} url
     */
    constructor(settings, isDev, preloadScript, url) {
        // Load previous window dimensions
        const winState = winStateKeeper({defaultWidth:  800,
                                         defaultHeight: 800});

        super({x:              winState.x,
               y:              winState.y,
               width:          winState.width,
               height:         winState.height,
               minWidth:       640,
               minHeight:      320,
               frame:          false,
               icon:           'ckan.ico',
               show:           false,
               darkTheme:      settings.darkMode,
               webPreferences: {preload: preloadScript}});

        // Open the dev tools in dev mode; page will close them if it loads successfully
        if (isDev)
            this.webContents.openDevTools();

        // Don't show a blank window while initializing
        this.once('ready-to-show', this.show);

        // Remember window dimensions on exit
        this.on('show', () => winState.manage(this));

        // Tell the window when it is (un)maximized
        this.on('maximize',   () => this.webContents.send('onMaximized', true));
        this.on('unmaximize', () => this.webContents.send('onMaximized', false));
        ipcMain.handle('isMaximized', () => this.isMaximized());

        // Save settings on close
        this.on('close', evt => settings.save());

        // Load the index.html of the app
        this.loadURL(url);

        // React to the buttons in the window header
        ipcMain.on('toggleDevTools', () => this.webContents.toggleDevTools());
        ipcMain.on('closeDevTools',  () => this.webContents.closeDevTools());
        ipcMain.on('minimize',       () => this.minimize());
        ipcMain.on('maximize',       () => this.isMaximized() ? this.restore()
                                                              : this.maximize());
        ipcMain.on('close',          () => this.close());

        // Provide additional services to the renderer
        ipcMain.handle('showOpenDialog', async (evt, options) =>
            await dialog.showOpenDialog(this, options));
    }

}
