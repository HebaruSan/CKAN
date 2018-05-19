import React          from 'react';
import { createRoot } from 'react-dom/client';

import Root           from './Root.js';

window.main.isDev().then(/** @param {boolean} isDev */
                         isDev => {
    window.main.getSettings().then(/** @param {object} settings */
                                   settings => {
        if (isDev) {
            window.addEventListener('keydown', evt => {
                switch (evt.key) {
                    case 'F12':
                        window.main.toggleDevTools();
                        evt.preventDefault();
                        break;
                }
            });
        }

        window.addEventListener('beforeunload', evt =>
            window.Instances.ReleaseLock({}, (error) => {
                if (error) {
                    throw error;
                    /* Or should we do this?
                    evt.preventDefault();
                    return evt.returnValue = error;
                    */
                }
            }));

        createRoot(/** @type {HTMLDivElement} */
                (document.getElementById('root'))).render(
                    <Root isDev={isDev}
                          DarkMode={settings.darkMode}
                          onDevTools={window.main.toggleDevTools}
                          onMinimize={window.main.minimize}
                          onMaximize={window.main.maximize}
                          onClose={window.main.close} />);

        // Close dev tools if no exceptions thrown on load
        if (isDev)
            window.main.closeDevTools();
    });
});
