import electron     from 'electron';
import EventEmitter from 'events';
import autobind     from 'class-autobind';

import path         from 'path';
import jsonfile     from 'jsonfile';
import mkdirp       from 'mkdirp';

// Inspired by electron-window-state

export default class Settings extends EventEmitter {
	constructor(win) {
		super();
		autobind(this);
		// Minutes between auto refreshes
		this.refreshInterval      = 60;
		// Time of last refresh
		this.lastRefreshTimestamp = null;

		this.path = this.configPath();
		this.load();

		win.on('closed', this.save);
	}

	configPath() {
		var app = electron.app || electron.remote.app;
		return path.join(app.getPath('userData'), 'ckan-settings.json');
	}

	notifyListeners() {
		this.emit('change');
	}

	load() {
		try {
			const saved = jsonfile.readFileSync(this.path);
			for (var prop in saved) {
				this[prop] = saved[prop];
			}
			this.lastRefreshTimestamp = new Date(this.lastRefreshTimestamp);
		} catch (err) { }
	}

	save() {
      mkdirp.sync(path.dirname(this.path));
      jsonfile.writeFileSync(this.path, {
		  refreshInterval:      this.refreshInterval,
		  lastRefreshTimestamp: this.lastRefreshTimestamp,
	  });
	}

}
