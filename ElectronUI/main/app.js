import { remote }           from 'electron';
import React, { Component } from 'react';
import ReactDOM             from 'react-dom';

import InstancesService     from '../Instances/InstancesService.js';
import ModulesService       from '../Modules/ModulesService.js';

import Root                 from './Root.js';

import Settings             from '../Settings/Settings.js';

const settings = remote.getGlobal('Settings');

ReactDOM.render(<Root Settings={settings} />, document.getElementById('root'));

// If we get to this point, we don't need the dev tools
remote.getCurrentWindow().webContents.closeDevTools();
