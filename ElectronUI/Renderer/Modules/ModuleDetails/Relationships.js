/** @jsx jsx */
import { PureComponent }  from 'react';
import { jsx, css }       from '@emotion/react';

import List               from '@mui/material/List';
import ListSubheader      from '@mui/material/ListSubheader';

import RelationshipBranch from './RelationshipBranch.js';

export default class Relationships extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
    }

    /**
     * @param {string} name
     * @param {object[]} group
     * @returns {?jsx.JSX.Element}
     */
    renderGroup(name, group) {
        const { module } = this.props;

        return group === null
            ? null
            : (
                <List disablePadding={true} dense={true}>
                    <ListSubheader color="primary"
                        inset={true}
                        css={css({paddingLeft: 48})}
                        disableSticky={true}>
                        {name}
                    </ListSubheader>
                    { group.map(rel => <RelationshipBranch ancestors={[module.Identifier]}
                                                           key={rel.Identifier}
                                                           node={rel} />) }
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
