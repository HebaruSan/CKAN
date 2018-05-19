import React, { PureComponent } from 'react';
import autobind                 from 'class-autobind';
import electron, { app, Menu, nativeImage, Tray, Notification, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

export default class TrayIcon {
    constructor(settings) {
        autobind(this);
        this.lastRefreshTimestamp   = settings.lastRefreshTimestamp;
        this.refreshIntervalMinutes = settings.refreshInterval;
        this.refreshTimer = null;

        this.tray = null;

        this.ckanIcon = nativeImage.createFromPath(path.join(__dirname, '..', 'ckan-32.png'));
        ipcMain.on('updated', (ev, count) => {
            if (count > 0) {
                this.notify(
                    `${count} upgrades available`,
                    "Click to upgrade...",
                    () => {
                        this.unMinimizeAll();
                        this.upgradeAll();
                    },
                );
            }
        });

        this.contextMenu = Menu.buildFromTemplate([
            {
                label: 'Check for updates...',
                type:  'normal',
                click: () => {
                    this.notify("Updating", "Downloading metadata updates...");
                    this.refresh();
                }
            },
            { type: 'separator' },
            {
                label: 'Settings',
                type:  'normal',
                click: this.openSettings,
            },
            { type: 'separator' },
            {
                label: 'Quit',
                type:  'normal',
                click: () => app.quit(),
            },
        ]);
        this.tray = new Tray(this.ckanIcon);
        this.tray.setToolTip('CKAN');
        // popUpContextMenu doesn't work on Linux!
        // And the options parameter is required but can be empty!
        this.tray.on('click', () => {
            this.unMinimizeAll();
            this.contextMenu.popup({});
        });
        this.tray.setContextMenu(this.contextMenu);

        this.settings = settings;
        this.settings.on('change', () => {
            if (this.refreshIntervalMinutes !== this.settings.refreshInterval) {
                this.refreshIntervalMinutes = this.settings.refreshInterval;
                this.startRefreshTimer();
            }
        });
        this.startRefreshTimer();
    }

    notify(title, message, onClick) {
        var notif = new Notification({
            icon:  this.ckanIcon,
            title: title,
            body:  message
        });
        if (onClick) {
            notif.on('click',  onClick);
        }
        notif.show();
    }

    unMinimizeAll() {
        BrowserWindow.getAllWindows().filter(
            w => w.isMinimized()
        ).forEach(
            w => w.restore()
        );
    }

    openSettings() {
        this.unMinimizeAll();
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('openSettings', 'tray');
        });
    }

    startRefreshTimer() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        var timeTillUpdate = this.lastRefreshTimestamp ? (
            this.refreshIntervalMinutes * 60 * 1000
            - ((new Date()).getTime() - this.lastRefreshTimestamp.getTime())
        ) : 0;
        if (timeTillUpdate < 1) {
            timeTillUpdate = 1;
        }
        this.refreshTimer = setTimeout(() => {
            this.refresh();
            this.startRefreshTimer();
        }, timeTillUpdate);
    }

    refresh() {
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('refresh', 'tray');
        });
        this.lastRefreshTimestamp = new Date();
        this.settings.lastRefreshTimestamp = this.lastRefreshTimestamp;
    }

    upgradeAll() {
        BrowserWindow.getAllWindows().forEach(win => {
            win.webContents.send('upgrade-all', 'tray');
        });
    }

}
