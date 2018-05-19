import React, { Fragment, PureComponent } from 'react';
import autobind                           from 'class-autobind';

import withStyles           from '@material-ui/core/styles/withStyles';

import List                 from '@material-ui/core/List';
import ListSubheader        from '@material-ui/core/ListSubheader';

import RelationshipBranch   from './RelationshipBranch.js';

const styles = {
    subHdr: {
        paddingLeft: 48,
    },
};

class Relationships extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
    }

    renderGroup(name, group) {
        const { classes, module } = this.props;

        return group === null
            ? null
            : (
                <List disablePadding={true} dense={true}>
                    <ListSubheader color="primary"
                        inset={true}
                        classes={{ inset: classes.subHdr }}
                        dense={true}
                        disableSticky={true}>
                        {name}
                    </ListSubheader>
                    { group.map(rel => <RelationshipBranch ancestors={[module.Identifier]} node={rel} />) }
                </List>
            );
    }

    render() {
        const { relationships } = this.props;

        return !relationships ? null : (
            <div>
                { this.renderGroup("Depends",    relationships.Depends)    }
                { this.renderGroup("Recommends", relationships.Recommends) }
                { this.renderGroup("Suggests",   relationships.Suggests)   }
                { this.renderGroup("Supports",   relationships.Supports)   }
                { this.renderGroup("Conflicts",  relationships.Conflicts)  }
            </div>
        );
    }
}

export default withStyles(styles)(Relationships);
