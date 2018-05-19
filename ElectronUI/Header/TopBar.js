import { remote }           from 'electron';
import React, { Component } from 'react';
import ReactDOM             from 'react-dom';
import PropTypes            from 'prop-types';
import classNames           from 'classnames';

import withStyles           from '@material-ui/core/styles/withStyles';

import AppBar               from '@material-ui/core/AppBar';
import Typography           from '@material-ui/core/Typography';
import Toolbar              from '@material-ui/core/Toolbar';
import IconButton           from '@material-ui/core/IconButton';
import Button               from '@material-ui/core/Button';
import Badge                from '@material-ui/core/Badge';
import Tooltip              from '@material-ui/core/Tooltip';

import MenuIcon             from '@material-ui/icons/Menu';
import CodeIcon             from '@material-ui/icons/Code';
import RemoveIcon           from '@material-ui/icons/Remove';
import AddIcon              from '@material-ui/icons/Add';
import CloseIcon            from '@material-ui/icons/Close';
import ArrowUpward          from '@material-ui/icons/ArrowUpward';
import Refresh              from '@material-ui/icons/Refresh';
import Settings             from '@material-ui/icons/Settings';

import ModulesTabs          from './ModulesTabs.js';
import SearchBox            from './SearchBox.js';

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: theme.zIndex.drawer + 1,
        "-webkit-app-region": "drag",
    },
    flex: {
        flex: 1,
    },
    refreshButton: {
        marginRight: 8,
        "-webkit-app-region": "no-drag",
    },
    upgradeButton: {
        "-webkit-app-region": "no-drag",
    },
    codeButton: {
        "-webkit-app-region": "no-drag",
    },
    menuButton: {
        marginLeft: -12,
        "-webkit-app-region": "no-drag",
    },
    closeButton: {
        marginRight: -12,
        "-webkit-app-region": "no-drag",
    },
    searchContainer: {
        width: 250,
    },
    instanceHeader: {
        opacity:     0.6,
        marginLeft:  16,
        marginRight: 16,
    }
});

class ButtonAppBar extends Component {
    render() {
        const {
            classes, Instance, tab,
            onMenu, onFilterChange, onSearch, onUpgradeAll, onRefresh, Refreshing,
            installedCount, availableCount, incompatibleCount, upgradeableCount,
            Version
        } = this.props;

        return (
            <AppBar className={classes.root} position="fixed">
                <Toolbar>
                    <Tooltip title="Select game instance">
                        <IconButton color="inherit" aria-label="Menu" className={classes.menuButton} onClick={onMenu}>
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>
                    <img src="ckan.png" />
                    <Typography>
                        {Version}
                    </Typography>

                    <Typography variant="title" color="default" align="center" noWrap={true}
                        className={classNames(classes.flex, classes.instanceHeader)}>
                        {Instance ? Instance.Name + " (KSP " + Instance.Version + ")" : ""}
                    </Typography>

                    <Tooltip title="Dev tools">
                        <IconButton color="inherit"
                            className={classes.codeButton}
                            onClick={ () => remote.getCurrentWindow().webContents.openDevTools() }>
                            <CodeIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Settings">
                        <IconButton color="inherit"
                            className={classes.codeButton}
                            onClick={this.props.onOpenSettings}>
                            <Settings />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Miminize">
                        <IconButton color="inherit" aria-label="Minimize" className={classes.closeButton}
                            onClick={ () => remote.getCurrentWindow().minimize() }>
                            <RemoveIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Maximize">
                        <IconButton color="inherit" aria-label="Maximize" className={classes.closeButton}
                            onClick={ () => {
                                const win = remote.getCurrentWindow();
                                if (win.isMaximized()) {
                                    win.restore();
                                } else {
                                    win.maximize();
                                }
                            } }>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Quit">
                        <IconButton color="inherit" aria-label="Close" className={classes.closeButton}
                            onClick={ () => remote.getCurrentWindow().close() }>
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
                <Toolbar>
                    {
                        upgradeableCount > 0
                            ?
                                <Tooltip title="Upgrade all">
                                    <Badge color="secondary" badgeContent={upgradeableCount}>
                                        <Button variant="fab" mini={true}
                                            className={classes.upgradeButton}
                                            onClick={onUpgradeAll}
                                            color="default">
                                            <ArrowUpward />
                                        </Button>
                                    </Badge>
                                </Tooltip>
                            : null
                    }

                    <Tooltip title="Refresh module list">
                        <IconButton
                            className={classes.refreshButton}
                            onClick={onRefresh}
                            disabled={Refreshing}
                            color="secondary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <ModulesTabs value={tab}
                        onChange={onFilterChange}
                        installedCount={installedCount}
                        availableCount={availableCount}
                        incompatibleCount={incompatibleCount}
                        />
                    <Toolbar disableGutters={true} className={classes.searchContainer}>
                        <span className={classes.flex}></span>
                        <SearchBox className={classes.search}
                            onChange={onSearch}
                            onRequestSearch={onSearch}
                            />
                    </Toolbar>
                </Toolbar>
            </AppBar>
        );
    }
}

export default withStyles(styles)(ButtonAppBar);
