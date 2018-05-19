// Module to control application life
// Module to create native browser window
const {app, BrowserWindow} = require('electron');

const path = require('path');
const url  = require('url');
const os   = require('os');
const winStateKeeper = require('electron-window-state');

import Settings             from '../Settings/Settings.js';
import TrayIcon             from '../TrayIcon/TrayIcon.js';

// Keep a global reference of the window object;
// if you don't, the window will be closed automatically
// when the Javascript object is garbage collected.
let mainWindow;
let trayIcon;

function createWindow() {
    // Load previous window dimensions
    let winState = winStateKeeper({
        defaultWidth:  800,
        defaultHeight: 800
    });

    // Create the browser window
    mainWindow = new BrowserWindow({
        x:         winState.x,
        y:         winState.y,
        width:     winState.width,
        height:    winState.height,
        minWidth:  640,
        minHeight: 320,
        frame:     false,
        icon:      'ckan.ico',
        show:      false
    });

    global.Settings = new Settings(mainWindow);
    trayIcon = new TrayIcon(global.Settings);

    // Remember window dimensions on exit
    winState.manage(mainWindow);

    // Open the dev tools; page will close them if it loads successfully
    mainWindow.webContents.openDevTools();

    // Don't show a blank window while initializing
    mainWindow.once('ready-to-show', mainWindow.show);

    // and load the index.html of the app
    mainWindow.loadURL(url.format({
        protocol: 'file:',
        pathname: path.join(__dirname, 'index.html'),
        slashes:  true
    }));

    // Emitted when the window is closed
    mainWindow.on('closed', function() {
        // Dereference the window object; usually you would store
        // windows in an array if your app supports multi windows,
        // this is the time when you should delete the corresponding element
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization
// and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function() {
    // On OSX it is common for applications and their menu bar to stay active
    // until the user quits explicitly with Cmd+Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.
