import React, { Component } from 'react';
import autobind             from 'class-autobind';

import withStyles           from '@material-ui/core/styles/withStyles';

import ListItem             from '@material-ui/core/ListItem';
import ListItemText         from '@material-ui/core/ListItemText';
import ListItemSecondary    from '@material-ui/core/ListItemSecondaryAction';
import Typography           from '@material-ui/core/Typography';
import IconButton           from '@material-ui/core/IconButton';
import Tooltip              from '@material-ui/core/Tooltip';
import Avatar               from '@material-ui/core/Avatar';
import ListItemAvatar       from '@material-ui/core/ListItemAvatar';

import Folder               from '@material-ui/icons/Folder';
import ArrowUpward          from '@material-ui/icons/ArrowUpward';
import RemoveCircle         from '@material-ui/icons/RemoveCircle';
import AddCircle            from '@material-ui/icons/AddCircle';
import FileDownload         from '@material-ui/icons/FileDownload';
import Cloud                from '@material-ui/icons/Cloud';
import CloudOff             from '@material-ui/icons/CloudOff';

import ModuleDetails        from './ModuleDetails/ModuleDetails.js';

const buttonWidth = 36;

const styles = theme => ({
    highlighted: {
        backgroundColor: theme.palette.secondary['A700'],
        color:           theme.palette.getContrastText(theme.palette.secondary['A700']),
        // Curved outlines are nice
        borderRadius: 3,
        // Expand beyond edge of text
        // TODO: Put this behind neighboring text
        margin:      -2,
        padding:      2,
    },
    listText: {
        flex: 1,
    },
    listButton: {
        width:        buttonWidth,
        height:       buttonWidth,
        marginLeft:  -buttonWidth / 6,
        marginRight: -buttonWidth / 6,
    },
    noWrapClass: {
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
    },
    secondaryContainer: {
        position: 'relative',
        '&:hover $actions': {
            opacity: 1,
        },
    },
    actions: {
        position: 'absolute',
        right: 0,
        width: 2 * (buttonWidth + 4),
        marginRight: -buttonWidth / 2,
        opacity: 0,
    },
});

class ModulesListItem extends Component {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            detailsOpen: false,
        };
        this.textClasses = {
            primary:   props.classes.noWrapClass,
            secondary: props.classes.noWrapClass
        };
    }

    highlightText(whole, searchFor, classes) {
        if (searchFor.length <= 0
            || searchFor.startsWith("@")
            || searchFor.startsWith("~")) {
            // No possibility of a match
            return [whole];
        }
        // Look for the search terms
        var where = whole.toLowerCase().indexOf(searchFor.toLowerCase(), 0);
        if (where === -1) {
            // Not found, no special formatting
            return [whole];
        } else {
            // We have a match! Highlight it
            var nodes = [];
            // Pre-match text
            nodes.push(whole.substring(0, where));
            // Match text
            var end = where + searchFor.length;
            nodes.push(<span className={classes.highlighted}>
                {whole.substring(where, end)}
            </span>);
            // Post-match processing via recursion
            if (end < whole.length) {
                nodes = nodes.concat(this.highlightText(
                    whole.substring(end, whole.length + 1),
                    searchFor,
                    classes
                ));
            }
            return nodes;
        }
    }

    highlightAuthors(authors, searchFor, classes) {
        if (searchFor.length <= 1
            || !searchFor.startsWith("@")
            || searchFor.startsWith("~")) {
            // Not an author search, just join them
            return [authors.join(', ')];
        } else {
            var nodes = [];
            const authorSearch = searchFor.substr(1).toLowerCase();
            for (var i = 0; i < authors.length; ++i) {
                if (i > 0) {
                    nodes.push(', ');
                }
                if (authors[i].toLowerCase().startsWith(authorSearch)) {
                    nodes.push(<span className={classes.highlighted}>
                        {authors[i].substring(0, authorSearch.length)}
                    </span>);
                    nodes.push(authors[i].substring(
                        authorSearch.length,
                        authors[i].length
                    ));
                } else {
                    nodes.push(authors[i]);
                }
            }
            return nodes;
        }
    }

    handleRemove() {
        alert("UNINSTALL " + this.props.module.Identifier);
    }

    handleInstall() {
        alert("INSTALL " + this.props.module.Identifier);
    }

    handleUpgrade() {
        alert("UPGRADE " + this.props.module.Identifier);
    }

    toggleDetails() {
        this.setState({ detailsOpen: !this.state.detailsOpen });
    }

    render() {
        const { style, classes, module, Search, onInstall, onUninstall, onUpgrade } = this.props;
        const { detailsOpen } = this.state;

        return (
            <div style={style}>

                <ListItem
                    button={true}
                    component="div"
                    ContainerComponent="div"
                    ContainerProps={{ className: classes.secondaryContainer }}
                    onClick={this.toggleDetails}>

                    <ListItemAvatar>
                        <Avatar>{
                              module.Installed   ? <Folder />
                            : module.Installable ? <Cloud />
                            :                      <CloudOff />
                        }</Avatar>
                    </ListItemAvatar>

                    <ListItemText className={classes.listText} disableTypography={false}
                        classes={this.textClasses}
                        secondary={this.highlightText(module.Abstract, Search, classes)}>
                        {
                            module.Name === module.Identifier
                                ? this.highlightText(module.Name, Search, classes)
                                : this.highlightText(module.Name, Search, classes)
                                    .concat([" ("])
                                    .concat(this.highlightText(module.Identifier, Search, classes))
                                    .concat([")"])
                        } {
                            [' ', module.Version]
                        } {
                            module.Authors
                                ? [" by "].concat(this.highlightAuthors(module.Authors, Search, classes))
                                : []
                        }
                    </ListItemText>

                    <ListItemSecondary className={classes.actions}>
                        {
                            module.Upgradeable ? (
                                <Tooltip title="Upgrade">
                                    <IconButton className={classes.listButton} color="secondary" onClick={this.handleUpgrade}>
                                        <ArrowUpward />
                                    </IconButton>
                                </Tooltip>
                            ) : ''
                        } {
                            module.Installed ? (
                                <Tooltip title="Uninstall">
                                    <IconButton className={classes.listButton} color="secondary" onClick={this.handleRemove}>
                                        <RemoveCircle />
                                    </IconButton>
                                </Tooltip>
                            ) : module.Installable ? (
                                <Tooltip title="Install">
                                    <IconButton className={classes.listButton} color="secondary" onClick={this.handleInstall}>
                                        <AddCircle />
                                    </IconButton>
                                </Tooltip>
                            ) : ''
                        }
                        <ModuleDetails module={module}
                            open={detailsOpen}
                            onClose={this.toggleDetails}
                            onRemove={this.handleRemove}
                            onInstall={this.handleInstall}
                            onUpgrade={this.handleUpgrade}
                            />
                    </ListItemSecondary>
                </ListItem>

            </div>
        );
    }
}

export default withStyles(styles)(ModulesListItem);
