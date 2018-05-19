/** @jsx jsx */
import { Fragment, PureComponent } from 'react';
import { jsx, css }                from '@emotion/react';
import { css as cssName }          from '@emotion/css';

import List                        from '@mui/material/List';
import ListItem                    from '@mui/material/ListItem';
import ListItemIcon                from '@mui/material/ListItemIcon';
import ListItemText                from '@mui/material/ListItemText';
import ListSubheader               from '@mui/material/ListSubheader';
import Collapse                    from '@mui/material/Collapse';

import ChevronRight                from '@mui/icons-material/ChevronRight';
import KeyboardArrowDown           from '@mui/icons-material/KeyboardArrowDown';

export default class RelationshipBranch extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {expanded:     false,
                      childModules: {}};
    }

    loadGrandchildren(identifiers, afterFunc) {
        if (identifiers && identifiers.length > 0) {
            const first = identifiers[0];
            const rest  = identifiers.splice(1);

            if (this.state.childModules.hasOwnProperty(first)) {
                // Already have this one, skip to next
                this.loadGrandchildren(rest, afterFunc);
            } else {
                window.ModuleDetails.GetMoreRelationships({
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
        return group ? group.map(rel => rel.Identifier)
                     : [];
    }

    addChildren(top, children) {
        const newChildModules = {};
        for (const prop in this.state.childModules) {
            newChildModules[prop] = this.state.childModules[prop];
        }
        newChildModules[top] = children;
        this.setState({ childModules: newChildModules });
    }

    handleToggle = () => {
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
                ].map(group => this.grandchildIdentifiers(group))
                .reduce((a, b) => a.concat(b),
                        []),
                () => this.setState({ expanded: !this.state.expanded })
            );
        }
    }

    renderGroup(name, group) {
        const { node, ancestors } = this.props;
        const { childModules    } = this.state;
        const childAncestors = ancestors.concat([ node.Identifier ]);

        return group === null ? null : (
            <List css={css({paddingLeft: 48})} disablePadding={true} dense={true}>
                <ListSubheader color="primary"
                    inset={true}
                    classes={{ inset: cssName({paddingLeft: 40}) }}
                    disableSticky={true}
                    css={css({lineHeight: 1})}>
                    {name}
                </ListSubheader>
                {
                    group.map(rel => (
                        <RelationshipBranch key={rel.Identifier}
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
        const { expanded } = this.state;
        const { node } = this.props;

        const hasChildren = !!(node.Relationships && (
               node.Relationships.Depends
            || node.Relationships.Recommends
            || node.Relationships.Suggests
            || node.Relationships.Supports
            || node.Relationships.Conflicts
        ));

        return (
            <Fragment>
                <ListItem dense={true}
                    css={css({lineHeight: 1})}
                    button={hasChildren}
                    onClick={hasChildren ? this.handleToggle : undefined}>
                    { hasChildren ? (
                        <ListItemIcon>
                            { expanded ? ( <KeyboardArrowDown color="secondary" /> )
                                       : ( <ChevronRight color="secondary" /> ) }
                        </ListItemIcon>
                    ) : null }
                    <ListItemText inset={!hasChildren}>
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
