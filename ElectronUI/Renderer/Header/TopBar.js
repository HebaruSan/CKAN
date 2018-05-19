/** @jsx jsx */
import { Component }      from 'react';
import { jsx, css }       from '@emotion/react';

import AppBar             from '@mui/material/AppBar';
import Typography         from '@mui/material/Typography';
import Toolbar            from '@mui/material/Toolbar';
import IconButton         from '@mui/material/IconButton';
import Button             from '@mui/material/Button';
import Badge              from '@mui/material/Badge';
import Tooltip            from '@mui/material/Tooltip';

import MenuIcon           from '@mui/icons-material/Menu';
import CodeIcon           from '@mui/icons-material/Code';
import MinimizeIcon       from '@mui/icons-material/Minimize';
import FullscreenIcon     from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CloseIcon          from '@mui/icons-material/Close';
import ArrowUpwardIcon    from '@mui/icons-material/ArrowUpward';
import RefreshIcon        from '@mui/icons-material/Refresh';
import SettingsIcon       from '@mui/icons-material/Settings';
import DarkModeIcon       from '@mui/icons-material/DarkMode';
import LightModeIcon      from '@mui/icons-material/LightMode';

import ModulesTabs        from './ModulesTabs.js';
import SearchBox          from './SearchBox.js';
import CkanIcon           from './ckan.png';

/**
 * Need this for IpcRendererEvent
 * @typedef {import('electron')} Electron
 */

export default class ButtonAppBar extends Component {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {maximized: false};
    }

    componentDidMount() {
        window.main.isMaximized().then(/** @param {boolean} maximized */
                                       maximized => this.setState({maximized}));
        window.main.onMaximized(/**
                                 * @param {Electron.IpcRendererEvent} evt
                                 * @param {boolean} maximized
                                 */
                                (evt, maximized) => this.setState({maximized}));
    }

    render() {
        const {
            isDev,
            Instance, tab,
            installedCount, availableCount, incompatibleCount, upgradeableCount,
            Version,
            DarkMode,

            onMenu, onDevTools, onOpenSettings, onMinimize, onMaximize, onClose,
            onFilterChange, onSearch, onUpgradeAll, onRefresh, Refreshing,
            onToggleDarkMode,
        } = this.props;

        const { maximized } = this.state;

        return (
            <AppBar position="fixed"
                    css={css({flexGrow:        1,
                              WebkitAppRegion: 'drag'})}>
                <Toolbar variant="dense">
                    <Tooltip title="Select game instance">
                        <IconButton color="inherit"
                                    aria-label="Menu"
                                    css={css({marginLeft:      -12,
                                              WebkitAppRegion: 'no-drag'})}
                                    onClick={onMenu}>
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                    <img src={CkanIcon} />
                    <Typography>
                        {Version}
                    </Typography>

                    <Typography variant="h1"
                                color="default"
                                align="center"
                                noWrap={true}
                                css={css({flex:        1,
                                          opacity:     0.6,
                                          marginLeft:  16,
                                          marginRight: 16})}>
                        {Instance ? Instance.Name + " (KSP " + Instance.Version + ")"
                                  : "No instance loaded"}
                    </Typography>

                    {!isDev ? null :
                        <Tooltip title="Dev tools">
                            <IconButton color="inherit"
                                        css={css({WebkitAppRegion: 'no-drag'})}
                                        onClick={onDevTools}>
                                <CodeIcon/>
                            </IconButton>
                        </Tooltip>}

                    <Tooltip title={DarkMode ? 'Light mode'
                                             : 'Dark mode'}>
                        <IconButton color="inherit"
                                    css={css({WebkitAppRegion: 'no-drag'})}
                                    onClick={onToggleDarkMode}>
                            {DarkMode ? <LightModeIcon/>
                                      : <DarkModeIcon/>}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Settings">
                        <IconButton color="inherit"
                                    css={css({WebkitAppRegion: 'no-drag'})}
                                    onClick={onOpenSettings}>
                            <SettingsIcon/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Miminize">
                        <IconButton color="inherit"
                                    aria-label="Minimize"
                                    css={css({marginRight:     -12,
                                              WebkitAppRegion: 'no-drag'})}
                                    onClick={onMinimize}>
                            <MinimizeIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={maximized ? 'Unmaximize'
                                              : 'Maximize'}>
                        <IconButton color="inherit"
                                    aria-label="Maximize"
                                    css={css({marginRight:     -12,
                                              WebkitAppRegion: 'no-drag'})}
                                    onClick={onMaximize}>
                            {maximized ? <FullscreenExitIcon/>
                                       : <FullscreenIcon/>}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Quit">
                        <IconButton color="inherit"
                                    aria-label="Close"
                                    css={css({marginRight:     -12,
                                              WebkitAppRegion: 'no-drag'})}
                                    onClick={onClose}>
                            <CloseIcon/>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
                <Toolbar variant="dense">
                    {
                        upgradeableCount > 0
                            ?
                                <Tooltip title="Upgrade all">
                                    <Badge color="secondary"
                                           badgeContent={upgradeableCount}>
                                        <Button variant="contained"
                                                css={css({WebkitAppRegion: 'no-drag'})}
                                                onClick={onUpgradeAll}>
                                            <ArrowUpwardIcon/>
                                        </Button>
                                    </Badge>
                                </Tooltip>
                            : null
                    }

                    <Tooltip title="Refresh module list">
                        <span>
                            <IconButton css={css({marginRight:     8,
                                                  WebkitAppRegion: 'no-drag'})}
                                        onClick={onRefresh}
                                        disabled={Refreshing}
                                        color="secondary">
                                <RefreshIcon/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <ModulesTabs value={tab}
                                 onChange={onFilterChange}
                                 installedCount={installedCount}
                                 availableCount={availableCount}
                                 incompatibleCount={incompatibleCount} />
                    <Toolbar variant="dense"
                             disableGutters={true}
                             css={css({width: 250})}>
                        <span css={css({flex: 1})}></span>
                        <SearchBox onChange={onSearch}
                                   onRequestSearch={onSearch} />
                    </Toolbar>
                </Toolbar>
            </AppBar>
        );
    }
}
