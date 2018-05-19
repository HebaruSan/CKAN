/** @jsx jsx */
import { Component }     from 'react';
import { jsx, css }      from '@emotion/react';

import MenuList          from '@mui/material/MenuList';
import ListSubheader     from '@mui/material/ListSubheader';
import Divider           from '@mui/material/Divider';
import Typography        from '@mui/material/Typography';
import IconButton        from '@mui/material/IconButton';
import Button            from '@mui/material/Button';
import Tooltip           from '@mui/material/Tooltip';
import Toolbar           from '@mui/material/Toolbar';

import ChevronLeft       from '@mui/icons-material/ChevronLeft';
import AddCircle         from '@mui/icons-material/AddCircle';

import InstancesListItem from './InstancesListItem.js';

const styles = theme => ({
    menuHdrBar: {
        backgroundColor: theme.palette.primary.dark,
    },
});

export default class InstancesList extends Component {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {/** @type {object[]} */
                      instances: []};
        this.everOpen = false;
        this.load();
    }

    load() {
        const openCallback = this.props.onOpen;
        window.Instances.Get({},
                             /**
                              * @param {?string} error
                              * @param {object[]} instances
                              */
                             (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                this.setState({instances});
                const cur = instances.find(i => i.Current);
                if (cur) {
                    if (this.props.onInstanceChange) {
                        this.props.onInstanceChange(cur);
                    }
                } else {
                    // If there's no default, they need to choose
                    openCallback();
                }
            }
        });
    }

    AddInstance = () => {
        window.main.showOpenDialog({title:      'Choose KSP Instance',
                                    properties: ['openDirectory']})
            .then(({canceled, filePaths}) => {
                if (!canceled && filePaths) {
                    let name = "Instance";
                    for (let num = 1; true; ++num) {
                        name = "Instance " + num;
                        if (!this.state.instances.some(i => i.Name == name))
                            break;
                    }
                    window.Instances.Add({name, path: filePaths[0]},
                                         /**
                                          * @param {?string} error
                                          * @param {object[]} instances
                                          */
                                         (error, instances) => {
                        if (error) {
                            alert(error);
                        } else
                            this.setState({instances});
                    });
                }
            });
    }

    /**
     * @param {object} inst
     */
    handleSetDefault = inst => {
        const name = inst ? inst.Name : "";
        window.Instances.SetDefault(name,
                                    /**
                                     * @param {?string} error
                                     * @param {object[]} instances
                                     */
                                    (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                this.setState({instances});
            }
        });
    }

    /**
     * @param {object} inst
     */
    handleSelect = inst => {
        const name = inst ? inst.Name : "";
        if (!inst.Current) {
            window.Instances.SetCurrent(name,
                                        /**
                                         * @param {?string} error
                                         * @param {object[]} instances
                                         */
                                        (error, instances) => {
                if (error) {
                    alert(error);
                } else {
                    // Close the drawer
                    this.props.onBack();
                    this.setState({instances});
                    // Tell parent that the current instance changed
                    if (this.props.onInstanceChange) {
                        this.props.onInstanceChange(instances.find(i => i.Name === name));
                    }
                }
            });
        }
    }

    /**
     * @param {object} inst
     */
    handleRemove = inst => {
        window.Instances.Remove(inst.Name,
                                /**
                                 * @param {?string} error
                                 * @param {object[]} instances
                                 */
                                (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                this.setState({instances});
            }
        });
    }

    /**
     * @param {string} fromName
     * @param {string} toName
     */
    handleRename = (fromName, toName) => {
        window.Instances.Rename({fromName, toName},
                                /**
                                 * @param {?string} error
                                 * @param {object[]} instances
                                 */
                                (error, instances) => {
            if (error) {
                alert(error);
                throw error;
            } else {
                this.setState({instances});
            }
        });
    }

    render() {
        const { onBack } = this.props;
        const { instances } = this.state;

        // TODO: Highlight active instance
        // TODO: Scroll to active instance

        return (
            <MenuList css={css({flexGrow:      1,
                                paddingTop:    0,
                                paddingBottom: 0})}>
                <ListSubheader sx={{pl: 0}}
                               disableGutters={true}>
                    <Toolbar sx={{pr: 1}}
                             disableGutters={true}>
                        <IconButton color="secondary"
                                    css={css({WebkitAppRegion: 'no-drag'})}
                                    onClick={onBack}>
                            <ChevronLeft/>
                        </IconButton>
                        <Typography color="default"
                                    variant="subtitle1"
                                    css={css({flex: 1})}>
                            Instances
                        </Typography>
                        <Tooltip title="Add instance">
                            <Button color="secondary"
                                    css={css({WebkitAppRegion: 'no-drag'})}
                                    size={instances.length > 0 ? 'small'
                                                               : 'large'}
                                    variant={instances.length > 0 ? 'outlined'
                                                                  : 'contained'}
                                    onClick={this.AddInstance}
                                    startIcon={<AddCircle/>}>
                                Add
                            </Button>
                        </Tooltip>
                    </Toolbar>
                    <Divider />
                </ListSubheader>
                {
                    instances.map(/** @param {object} inst */
                                  inst =>
                        <InstancesListItem key={inst.Name}
                                           Instance={inst}
                                           onSetDefault={this.handleSetDefault}
                                           onSelect={this.handleSelect}
                                           onRemove={this.handleRemove}
                                           onRename={this.handleRename} />
                    )
                }
            </MenuList>
        );
    }
}
