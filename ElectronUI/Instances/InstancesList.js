import React, { Component } from 'react';
import autobind             from 'class-autobind';
import { remote }           from 'electron';
const { dialog } = remote;
import os                   from 'os';

import withStyles           from '@material-ui/core/styles/withStyles';

import MenuList             from '@material-ui/core/MenuList';
import ListSubheader        from '@material-ui/core/ListSubheader';
import Divider              from '@material-ui/core/Divider';
import Typography           from '@material-ui/core/Typography';
import IconButton           from '@material-ui/core/IconButton';
import Tooltip              from '@material-ui/core/Tooltip';
import Toolbar              from '@material-ui/core/Toolbar';
import AppBar               from '@material-ui/core/AppBar';

import { Scrollbars }       from 'react-custom-scrollbars';

import ChevronLeft          from '@material-ui/icons/ChevronLeft';
import AddCircle            from '@material-ui/icons/AddCircle';

import InstancesService     from './InstancesService.js';
import InstancesListItem    from './InstancesListItem.js';

const drawerWidth = 320;

const styles = theme => ({
    root: {
        flexGrow:      1,
        paddingTop:    0,
        paddingBottom: 0,
    },
    flex: {
        flex: 1,
    },
    menuHdrBar: {
        backgroundColor: theme.palette.primary.dark,
        paddingLeft:  0,
        paddingRight: 0,
    },
    btn: {
        "-webkit-app-region": "no-drag",
    },
    scrollBars: {
        flexGrow: 1,
        width:    '100%',
        height:   '100%',
    }
});

class InstancesList extends Component {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            instances: []
        };
        this.everOpen = false;
        this.service = new InstancesService();
        this.load();
    }

    load() {
        const me = this;
        const openCallback = this.props.onOpen;
        this.service.Get({}, (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                me.setState({ instances: instances });
                var cur = instances.find(i => i.Current);
                if (cur) {
                    if (me.props.onInstanceChange) {
                        me.props.onInstanceChange(cur);
                    }
                } else {
                    // If there's no default, they need to choose
                    openCallback();
                }
            }
        });
    }

    AddInstance() {
        var me = this;
        dialog.showOpenDialog({
            title: "Choose KSP Instance",
            defaultPath: os.homedir(),
            properties: [
                'openDirectory'
            ]
        }, paths => {
            if (paths) {
                var name = "Instance";
                for (var num = 1; true; ++num) {
                    name = "Instance " + num;
                    if (!me.state.instances.find(i => i.Name == name)) {
                        break;
                    }
                }
                this.service.Add({name: name, path: paths[0]}, (error, instances) => {
                    if (error) {
                        alert(error);
                        throw error;
                    } else {
                        me.setState({ instances: instances });
                    }
                })
            }
        });
    }

    handleSetDefault(inst) {
        var me = this;
        var name = inst ? inst.Name : "";
        this.service.SetDefault(name, (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                me.setState({ instances: instances });
            }
        });
    }

    handleSelect(inst) {
        var me = this;
        var name = inst ? inst.Name : "";
        if (!inst.Current) {
            this.service.SetCurrent(name, (error, instances) => {
                if (error) {
                    alert(error);
                } else {
                    // Close the drawer
                    this.props.onBack();
                    me.setState({ instances: instances });
                    // Tell parent that the current instance changed
                    if (me.props.onInstanceChange) {
                        me.props.onInstanceChange(instances.find(i => i.Name === name));
                    }
                }
            });
        }
    }

    handleRemove(inst) {
        var me = this;
        this.service.Remove(inst.Name, (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                me.setState({ instances: instances });
            }
        });
    }

    handleRename(fromName, toName) {
        var me = this;
        this.service.Rename({fromName: fromName, toName: toName}, (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                me.setState({ instances: instances });
            }
        });
    }

    render() {
        const { classes, onBack, open } = this.props;
        const { instances } = this.state;

        // The list likes to display when it finishes loading
        // even if the parent drawer is closed.
        // But if you just return nothing when closed, it will
        // vanish instantly on close instead of sliding out.
        // Workaround.
        this.everOpen = this.everOpen || open;
        if (!this.everOpen) {
            return null;
        }

        // TODO: Scroll to active instance

        return (
            <Scrollbars className={classes.scrollBars}>
                <MenuList className={classes.root}>
                    <ListSubheader className={classes.menuHdrBar}>
                        <Toolbar disableGutters={true}>
                            <IconButton color="secondary" className={classes.btn} onClick={onBack}>
                                <ChevronLeft />
                            </IconButton>
                            <Typography color="default" variant="subheading" className={classes.flex}>
                                Instances
                            </Typography>
                            <Tooltip title="Add instance">
                                <IconButton color="secondary" className={classes.btn} onClick={this.AddInstance} >
                                    <AddCircle />
                                </IconButton>
                            </Tooltip>
                        </Toolbar>
                        <Divider />
                    </ListSubheader>
                    {
                        instances.map((inst, key) =>
                            <InstancesListItem key={inst.Name} Instance={inst}
                                onSetDefault={this.handleSetDefault}
                                onSelect={this.handleSelect}
                                onRemove={this.handleRemove}
                                onRename={this.handleRename}
                                />
                        )
                    }
                </MenuList>
            </Scrollbars>
        );
    }
}

export default withStyles(styles)(InstancesList);
