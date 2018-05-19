/** @jsx jsx */
import { Fragment, Component }        from 'react';
import { jsx, css }                   from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import CssBaseline                    from '@mui/material/CssBaseline';

import Brown                          from '@mui/material/colors/brown';
import BlueGrey                       from '@mui/material/colors/blueGrey';
import DeepOrange                     from '@mui/material/colors/deepOrange';

import TopBar                         from './Header/TopBar.js';
import InstancesDrawer                from './Instances/InstancesDrawer.js';
import ModulesLoader                  from './Modules/ModulesLoader.js';
import ModulesList                    from './Modules/ModulesList.js';
import SettingsView                   from './Settings/SettingsView.js';
import ErrorDialog                    from './Components/ErrorDialog.js';

export default class Root extends Component {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {
            drawerOpen:          false,
            currentSearch:       "",
            currentInstance:     null,
            /** @type {'installed'|'available'|'incompatible'} */
            currentModuleFilter: 'installed',

            errorOpen:    false,
            errorTitle:   '',
            errorMessage: '',

            /** @type {?object[]} installed */
            installed:    null,
            /** @type {?object[]} available */
            available:    null,
            /** @type {?object[]} incompatible */
            incompatible: null,

            upgradeableCount: 0,

            refreshing: false,

            settingsOpen: false,

            version: null,

            darkMode: this.props.DarkMode,
        };
        this.modulesLoader = new ModulesLoader(this.handleModulesLoad, this.handleModulesError);
    }

    componentDidMount() {
        this.getVersion();
    }

    getVersion() {
        try {
            window.CKAN.Version({}, /**
                                     * @param {?string} error
                                     * @param {string} version
                                     */
                                    (error, version) => {
                if (error)
                    this.showError(`Error response from DLL`, `${error}`);
                else
                    this.setState({version});
            });
        } catch (exc) {
            this.showError(`Failed to get CKAN version`, `${exc}`);
        }
    }

    openDrawer =   () => { this.setState({ drawerOpen: true                   }); }
    closeDrawer =  () => { this.setState({ drawerOpen: false                  }); }
    toggleDrawer = () => { this.setState({ drawerOpen: !this.state.drawerOpen }); }

    handleInstanceChange = instance => {
        this.setState({ currentInstance: instance });
        this.modulesLoader.load(this.state.currentModuleFilter, this.state.currentSearch);
    }

    /**
     * @param {string} value
     */
    handleSearch = value => {
        this.modulesLoader.redoSearch(value);
        this.setState({ currentSearch: value });
    }

    /**
     * @param {string} value
     */
    handleFilterChange = value => {
        this.setState({drawerOpen:          false,
                       currentModuleFilter: value});
    }

    handleUpgradeAll() {
        // TODO
        alert("UPGRADE ALL");
        this.setState({ upgradeableCount: 0 });
    }

    handleModulesLoad = values => {
        if (this.state.currentModuleFilter === 'installed'
            && values.installed
            && values.installed.length === 0) {
            values.currentModuleFilter = 'available';
        }
        if (values.installed) {
            values.upgradeableCount = values.installed.filter(mod => mod.Upgradeable).length;
        }
        values.refreshing = false;
        this.setState(values);
    }

    /**
     * @param {string} title
     * @param {string} message
     */
    handleModulesError = (title, message) => {
        this.showError(title, message, () => {
            this.setState({ currentInstance: null, refreshing: false });
            this.openDrawer();
        });
    }

    handleRefresh = () => {
        this.setState({ refreshing: true });
        this.modulesLoader.refresh(this.state.currentSearch, (title, message) => this.showError(title, message, () => {
            this.setState({ refreshing: false });
        }));
    }

    /**
     * @param {string} title
     * @param {string} message
     * @param {function=} onClose
     */
    showError = (title, message, onClose) => {
        this.setState({errorOpen:    true,
                       errorTitle:   title,
                       errorMessage: message,
                       onErrorClose: onClose});
    }

    closeError = () => {
        if (this.state.onErrorClose) {
            this.state.onErrorClose();
        }
        this.setState({
            errorOpen:    false,
            onErrorClose: null
        });
    }

    openSettings = () => {
        this.setState({ settingsOpen: true });
    }

    toggleDarkMode = () => {
        const darkMode = !this.state.darkMode;
        this.setState({darkMode});
        window.main.setSetting('darkMode', darkMode);
    }

    render() {
        const {
            drawerOpen, currentSearch, currentInstance, currentModuleFilter,
            installed, available, incompatible, upgradeableCount, refreshing,
            errorOpen, errorTitle, errorMessage, settingsOpen, version,
            darkMode,
        } = this.state;
        const {
            Settings = {},
            isDev,
            onDevTools, onMinimize, onMaximize, onClose,
        } = this.props;

        return (
            <ThemeProvider theme={createTheme({
                zIndex: {
                    // Drawer is 1200, put the top bar on top of that
                    // https://mui.com/material-ui/customization/z-index/
                    appBar: 1300
                },
                typography: {
                    h1: {
                        fontSize:   20,
                        fontWeight: 'bold',
                    }
                },
                palette: {
                    mode:      darkMode ? 'dark' : 'light',
                    primary:   Brown,
                    secondary: BlueGrey,
                    error:     DeepOrange,
                }
            })}>
                <Fragment>
                    <CssBaseline />
                    <TopBar isDev={isDev}
                        tab={currentModuleFilter}
                        Refreshing={refreshing || !installed || !available || !incompatible}
                        onMenu={this.toggleDrawer}
                        onDevTools={onDevTools}
                        onOpenSettings={this.openSettings}
                        onMinimize={onMinimize}
                        onMaximize={onMaximize}
                        onClose={onClose}
                        onSearch={this.handleSearch}
                        onFilterChange={this.handleFilterChange}
                        Instance={currentInstance}
                        installedCount={installed ? installed.length : null}
                        availableCount={available ? available.length : null}
                        incompatibleCount={incompatible ? incompatible.length : null}
                        upgradeableCount={upgradeableCount}
                        onUpgradeAll={this.handleUpgradeAll}
                        onRefresh={this.handleRefresh}
                        Version={version}
                        DarkMode={darkMode}
                        onToggleDarkMode={this.toggleDarkMode}
                        />
                    <InstancesDrawer
                        open={drawerOpen}
                        onOpen={this.openDrawer}
                        onClose={this.closeDrawer}
                        onInstanceChange={this.handleInstanceChange}
                        />
                    <ModulesList
                        css={css({top: 2 * 56})}
                        Search={currentSearch}
                        Instance={currentInstance}
                        Filter={currentModuleFilter}
                        Modules={this.state[currentModuleFilter]}
                        Refreshing={refreshing}
                        onModuleClicked={this.closeDrawer}
                        />
                    <ErrorDialog onClose={this.closeError}
                        open={errorOpen}
                        title={errorTitle}
                        message={errorMessage}
                        />
                    <SettingsView open={settingsOpen}
                        Settings={Settings}
                        onClose={() => this.setState({settingsOpen: false})}
                        />
                </Fragment>
            </ThemeProvider>
        );
    }
}
