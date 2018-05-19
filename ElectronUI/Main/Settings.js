import { app, nativeTheme, ipcMain } from 'electron';
import EventEmitter                  from 'events';

import path                          from 'path';
import jsonfile                      from 'jsonfile';
import mkdirp                        from 'mkdirp';

// Inspired by electron-window-state

export default class Settings extends EventEmitter {
    constructor() {
        super();
        /**
         * Minutes between auto refreshes
         * @type {number}
         */
        this.refreshInterval = 60;
        /**
         * Time of last refresh
         * @type {?Date}
         */
        this.lastRefreshTimestamp = null;
        /**
         * Dark mode
         * @type {boolean}
         */
        this.darkMode = nativeTheme.shouldUseDarkColors;

        this.changed = false;
        this.path = this.#configPath();
        this.load();

        ipcMain.handle('getSettings', evt => this.toJSON());
        ipcMain.handle('setSetting', this.setSetting);
    }

    /**
     * @param {Electron.IpcMainInvokeEvent} evt
     * @param {string} key
     * @param {any} val
     * @returns {object}
     */
    setSetting = (evt, key, val) => {
        if (this[key] !== val) {
            this[key] = val;
            this.changed = true;
            switch (key) {
                case 'darkMode':
                    nativeTheme.themeSource = this.#themeSource();
                    break;
            }
        }
        return this.toJSON();
    }

    #configPath() {
        return path.join(app.getPath('userData'),
                         'ckan-settings.json');
    }

    notifyListeners() {
        this.emit('change');
    }

    toJSON() {
        return {
            refreshInterval:      this.refreshInterval,
            lastRefreshTimestamp: this.lastRefreshTimestamp,
            darkMode:             this.darkMode,
        };
    }

    load() {
        try {
            Object.assign(this, jsonfile.readFileSync(this.path,
                                                      {reviver: this.reviver}));
            nativeTheme.themeSource = this.#themeSource();
        } catch { }
    }

    /**
     * Convert values during deserialization
     *
     * @param {string} key
     * @param {any} val
     * @returns {any}
     */
    reviver(key, val) {
        switch (key) {
            case 'lastRefreshTimestamp':
                return new Date(val);
        }
        return val;
    }

    save() {
        if (this.changed) {
            mkdirp.sync(path.dirname(this.path));
            jsonfile.writeFileSync(this.path, this);
            this.changed = false;
        }
    }

    #themeSource() {
        return this.darkMode ? 'dark'
                             : 'light';
    }

}
