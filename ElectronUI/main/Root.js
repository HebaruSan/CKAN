import React, { Fragment, Component } from 'react';
import autobind             from 'class-autobind';
import { ipcRenderer }      from 'electron';

import CssBaseline          from '@material-ui/core/CssBaseline';

import MuiThemeProvider     from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme       from '@material-ui/core/styles/createMuiTheme';
import withStyles           from '@material-ui/core/styles/withStyles';

import Brown                from '@material-ui/core/colors/brown';
import BlueGrey             from '@material-ui/core/colors/blueGrey';

import Red                  from '@material-ui/core/colors/red';
import Orange               from '@material-ui/core/colors/orange';
import DeepOrange           from '@material-ui/core/colors/deepOrange';
import Yellow               from '@material-ui/core/colors/yellow';
import Amber                from '@material-ui/core/colors/amber';
import Grey                 from '@material-ui/core/colors/grey';

import TopBar               from '../Header/TopBar.js';
import InstancesDrawer      from '../Instances/InstancesDrawer.js';
import ModulesLoader        from '../Modules/ModulesLoader.js';
import ModulesList          from '../Modules/ModulesList.js';
import SettingsView         from '../Settings/SettingsView.js';
import ErrorDialog          from './ErrorDialog.js';
import CKANService          from './CKANService.js';

const theme = createMuiTheme({
    palette: {
        type:      'dark',
        primary:   Brown,
        secondary: BlueGrey,
        error:     DeepOrange
    }
});

const styles = theme => ({
    underTopBar: {
        // HACK: The top bar has 2 toolbars with dynamic sizes,
        // but it's all done in CSS so we can't re-use the logic directly.
        // This is from material-ui/src/styles/createMixins.js
        top:     2 * 56,
        [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
            top: 2 * 48
        },
        [theme.breakpoints.up('sm')]: {
            top: 2 * 64
        },
    }
});

class Root extends Component {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            drawerOpen:          false,
            currentSearch:       "",
            currentInstance:     null,
            currentModuleFilter: 'installed',

            errorOpen:    false,
            errorTitle:   '',
            errorMessage: '',

            installed:    null,
            available:    null,
            incompatible: null,

            upgradeableCount: 0,

            refreshing: false,

            settingsOpen: false,

            version: null,
        };
        this.modulesLoader = new ModulesLoader(this.handleModulesLoad, this.handleModulesError);

        // It would be nice to handle this entirely within the data object,
        // but it needs the search string,, which only the root has
        ipcRenderer.on('refresh',      this.handleRefresh);
        ipcRenderer.on('upgrade-all',  this.handleUpgradeAll);
        ipcRenderer.on('openSettings', this.openSettings);

        this.getVersion();
    }

    getVersion() {
        const svc = new CKANService();
        svc.Version({}, (error, result) => {
            if (error) {
                this.showError("Failed to get CKAN version", error.message);
            } else {
                this.setState({ version: result });
            }
        });
    }

    openDrawer()   { this.setState({ drawerOpen: true                   }); }
    closeDrawer()  { this.setState({ drawerOpen: false                  }); }
    toggleDrawer() { this.setState({ drawerOpen: !this.state.drawerOpen }); }

    handleInstanceChange(instance) {
        this.setState({ currentInstance: instance });
        this.modulesLoader.load(this.state.currentModuleFilter, this.state.currentSearch);
    }

    handleSearch(value) {
        this.modulesLoader.redoSearch(value);
        this.setState({ currentSearch: value });
    }

    handleFilterChange(value) {
        this.setState({ currentModuleFilter: value });
    }

    handleUpgradeAll() {
        // TODO
        alert("UPGRADE ALL");
        this.setState({ upgradeableCount: 0 });
    }

    handleModulesLoad(values) {
        if (this.state.currentModuleFilter === 'installed'
            && values.installed
            && values.installed.length === 0) {
            values.currentModuleFilter = 'available';
        }
        if (values.installed) {
            values.upgradeableCount = values.installed.filter(mod => mod.Upgradeable).length;
            ipcRenderer.send('updated', values.upgradeableCount);
        }
        values.refreshing = false;
        this.setState(values);
    }

    handleModulesError(title, message) {
        this.showError(title, message, () => {
            this.setState({ currentInstance: null, refreshing: false });
            this.openDrawer();
        });
    }

    handleRefresh() {
        this.setState({ refreshing: true });
        this.modulesLoader.refresh(this.state.currentSearch, (title, message) => this.showError(title, message, () => {
            this.setState({ refreshing: false });
        }));
    }

    showError(title, message, onClose) {
        this.setState({
            errorOpen:    true,
            errorTitle:   title,
            errorMessage: message,
            onErrorClose: onClose
        });
    }

    closeError() {
        if (this.state.onErrorClose) {
            this.state.onErrorClose();
        }
        this.setState({
            errorOpen:    false,
            onErrorClose: null
        });
    }

    openSettings() {
        this.setState({ settingsOpen: true });
    }

    render() {
        const {
            drawerOpen, currentSearch, currentInstance, currentModuleFilter,
            installed, available, incompatible, upgradeableCount, refreshing,
            errorOpen, errorTitle, errorMessage, settingsOpen, version
        } = this.state;
        const { classes, Settings } = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <Fragment>
                    <CssBaseline />
                    <TopBar tab={currentModuleFilter}
                        Refreshing={refreshing || !installed || !available || !incompatible}
                        onMenu={this.toggleDrawer}
                        onSearch={this.handleSearch}
                        onFilterChange={this.handleFilterChange}
                        Instance={currentInstance}
                        installedCount={installed ? installed.length : null}
                        availableCount={available ? available.length : null}
                        incompatibleCount={incompatible ? incompatible.length : null}
                        upgradeableCount={upgradeableCount}
                        onUpgradeAll={this.handleUpgradeAll}
                        onRefresh={this.handleRefresh}
                        onOpenSettings={this.openSettings}
                        Version={version}
                        />
                    <InstancesDrawer className={classes.underTopBar}
                        open={drawerOpen}
                        onOpen={this.openDrawer}
                        onClose={this.closeDrawer}
                        onInstanceChange={this.handleInstanceChange}
                        />
                    <ModulesList className={classes.underTopBar}
                        Search={currentSearch}
                        Instance={currentInstance}
                        Filter={currentModuleFilter}
                        Modules={this.state[currentModuleFilter]}
                        Refreshing={refreshing}
                        />
                    <ErrorDialog onClose={this.closeError}
                        open={errorOpen}
                        title={errorTitle}
                        message={errorMessage}
                        />
                    <SettingsView open={settingsOpen}
                        Settings={Settings}
                        onClose={ () => this.setState({ settingsOpen: false }) }
                        />
                </Fragment>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(Root);
