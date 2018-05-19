import React, { Component } from 'react';
import os                   from 'os';
import classNames           from 'classnames';

import withStyles           from '@material-ui/core/styles/withStyles';

import MenuItem             from '@material-ui/core/MenuItem';
import ListItemText         from '@material-ui/core/ListItemText';
import ListItemSecondary    from '@material-ui/core/ListItemSecondaryAction';
import Typography           from '@material-ui/core/Typography';
import IconButton           from '@material-ui/core/IconButton';
import Tooltip              from '@material-ui/core/Tooltip';

import Star                 from '@material-ui/icons/Star';
import StarBorder           from '@material-ui/icons/StarBorder';

import RenameDialog         from './RenameDialog.js';
import RemoveDialog         from './RemoveDialog.js';

const drawerWidth = 320;

const styles = theme => ({
    menuItem: {
        paddingTop:    20,
        paddingBottom: 20,
    },
    activeItem: {
        backgroundColor: theme.palette.secondary[700],
        '&:hover': {
            backgroundColor: theme.palette.secondary[600]
        }
    },
    listButton: {
        width:  24,
        height: 24,
    },
    listText: {
        paddingRight: 44,
    },
    version: {
        position: "absolute",
        top:      16,
        right:    82,
        display: "inline",
    },
    container: {
        '&:hover $actions': {
            opacity: 1,
        },
    },
    actions: {
        opacity: 0,
    },
});

class InstancesListItem extends Component {
    render() {
        const { classes, Instance, onSetDefault, onRemove, onSelect, onRename } = this.props;
        return (
            <MenuItem divider={true}
                className={
                    Instance.Current
                    ? classNames(classes.menuItem, classes.activeItem)
                    : classes.menuItem
                }
                disabled={!Instance.Valid}
                ContainerProps={{ className: classes.container }}
                onClick={ () => onSelect(Instance) }>

                {
                     Instance.Default
                        ?   <Tooltip title="Remove default designation">
                                <IconButton className={classes.listButton} color="primary" aria-label="Default" disabled={!Instance.Valid}
                                    onClick={ () => onSetDefault(null) }>
                                        <Star />
                                </IconButton>
                            </Tooltip>
                        :   <Tooltip title="Set default instance">
                                <IconButton className={classes.listButton} color="primary" aria-label="Not default" disabled={!Instance.Valid}
                                    onClick={ () => onSetDefault(Instance) }>
                                    <StarBorder />
                                </IconButton>
                            </Tooltip>
                }

                <ListItemText className={classes.listText}
                    disableTypography={true}
                    primary={
                        <Typography variant="subheading" noWrap={true} color="default">
                            {Instance.Name}
                            <Typography className={classes.version} component="span" noWrap={true} color="textSecondary" variant="caption">
                            {
                                Instance.Valid
                                    ? "KSP " + Instance.Version
                                    : "<INVALID>"
                            }
                            </Typography>
                        </Typography>
                    }
                    secondary={
                        <Tooltip title={Instance.Path}>
                            <Typography noWrap={true} color="secondary" variant="caption">{Instance.Path}</Typography>
                        </Tooltip>
                    }
                    />

                <ListItemSecondary className={classes.actions}>
                    <RenameDialog onRename={onRename} classes={classes} Instance={Instance} />
                    <RemoveDialog onRemove={onRemove} classes={classes} Instance={Instance} />
                </ListItemSecondary>

            </MenuItem>
        );
    }
}

export default withStyles(styles)(InstancesListItem);
