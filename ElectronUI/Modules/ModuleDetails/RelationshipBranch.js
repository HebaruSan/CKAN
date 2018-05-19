import React, { Fragment, PureComponent } from 'react';
import autobind                           from 'class-autobind';

import withStyles           from '@material-ui/core/styles/withStyles';

import IconButton           from '@material-ui/core/IconButton';
import List                 from '@material-ui/core/List';
import ListItem             from '@material-ui/core/ListItem';
import ListItemIcon         from '@material-ui/core/ListItemIcon';
import ListItemText         from '@material-ui/core/ListItemText';
import ListSubheader        from '@material-ui/core/ListSubheader';
import Collapse             from '@material-ui/core/Collapse';

import ChevronRight         from '@material-ui/icons/ChevronRight';
import KeyboardArrowDown    from '@material-ui/icons/KeyboardArrowDown';

import DetailsService       from './DetailsService.js';

const styles = {
    item: {
        lineHeight: 1
    },
    node: {
        paddingLeft: 48
    },
    subHdr: {
        paddingLeft: 40,
    },
    expandIcon: {
        // Shrink the rows
        height:      24,
        // Make the expandable rows line up with inset non expandable siblings
        marginRight: -8,
    },
};

// We need to go through withStyles to use recursion
let RelationshipBranchExportable;

class RelationshipBranch extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            expanded:     false,
            childModules: {},
        };
        this.service = null;
    }

    loadGrandchildren(identifiers, afterFunc) {
        if (identifiers && identifiers.length > 0) {
            const first = identifiers[0];
            const rest  = identifiers.splice(1);

            if (this.state.childModules.hasOwnProperty(first)) {
                // Already have this one, skip to next
                this.loadGrandchildren(rest, afterFunc);
            } else {
                if (this.service === null) {
                    this.service = new DetailsService();
                }

                this.service.GetMoreRelationships({
                    Identifier: first,
                    Ancestors:  this.props.ancestors,
                }, (error, newRel) => {
                    if (error) {
                        alert(error.message);
                    } else {
                        this.addChildren(first, newRel);
                        this.loadGrandchildren(rest, afterFunc);
                    }
                });
            }
        } else {
            afterFunc();
        }
    }

    grandchildIdentifiers(group) {
        return group
            ? group.map(rel => rel.Identifier)
            : [];
    }

    addChildren(top, children) {
        var newChildModules = {};
        for (var prop in this.state.childModules) {
            newChildModules[prop] = this.state.childModules[prop];
        }
        newChildModules[top] = children;
        this.setState({ childModules: newChildModules });
    }

    handleToggle() {
        if (this.state.expanded) {
            this.setState({ expanded: !this.state.expanded });
        } else {
            const { node } = this.props;
            this.loadGrandchildren(
                [
                    node.Relationships.Depends,
                    node.Relationships.Recommends,
                    node.Relationships.Suggests,
                    node.Relationships.Supports,
                    node.Relationships.Conflicts,
                ].map(
                    group => this.grandchildIdentifiers(group)
                ).reduce(
                    (a, b) => a.concat(b),
                    []
                ),
                () => this.setState({ expanded: !this.state.expanded })
            );
        }
    }

    renderGroup(name, group) {
        const { classes, node, ancestors } = this.props;
        const { childModules             } = this.state;
        const childAncestors = ancestors.concat([ node.Identifier ]);

        return group === null ? null : (
            <List disablePadding={true} dense={true} className={classes.node}>
                <ListSubheader color="primary"
                    inset={true}
                    classes={{ inset: classes.subHdr }}
                    dense={true}
                    disableSticky={true}
                    className={classes.item}>
                    {name}
                </ListSubheader>
                {
                    group.map(rel => (
                        <RelationshipBranchExportable
                            ancestors={childAncestors}
                            node={
                                // Override with dynamically loaded state if present
                                childModules[rel.Identifier] ? {
                                    Identifier:    rel.Identifier,
                                    Relationships: childModules[rel.Identifier],
                                } : rel
                            }
                            />
                    ))
                }
            </List>
        );
    }

    render() {
        const { expanded      } = this.state;
        const { classes, node } = this.props;

        const hasChildren = node.Relationships && (
               node.Relationships.Depends
            || node.Relationships.Recommends
            || node.Relationships.Suggests
            || node.Relationships.Supports
            || node.Relationships.Conflicts
        );

        return (
            <Fragment>
                <ListItem dense={true}
                    className={classes.item}
                    button={hasChildren}
                    onClick={hasChildren ? this.handleToggle : null}>
                    {
                        hasChildren ? (
                            // ListItemIcon won't let us change the color
                            expanded ? ( <KeyboardArrowDown color="primary" /> ) : ( <ChevronRight color="primary" /> )
                        ) : null
                    }
                    <ListItemText dense={true}
                        inset={!hasChildren}
                        disableGutters={hasChildren}>
                        {node.Identifier}
                    </ListItemText>
                </ListItem>
                {
                    !node.Relationships ? null : (
                        <Collapse in={expanded}>
                            { this.renderGroup("Depends",    node.Relationships.Depends)    }
                            { this.renderGroup("Recommends", node.Relationships.Recommends) }
                            { this.renderGroup("Suggests",   node.Relationships.Suggests)   }
                            { this.renderGroup("Supports",   node.Relationships.Supports)   }
                            { this.renderGroup("Conflicts",  node.Relationships.Conflicts)  }
                        </Collapse>
                    )
                }
            </Fragment>
        );
    }
}

// We need to go through withStyles to use recursion
RelationshipBranchExportable = withStyles(styles)(RelationshipBranch);

export default RelationshipBranchExportable;
