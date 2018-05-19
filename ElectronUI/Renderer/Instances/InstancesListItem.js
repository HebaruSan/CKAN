/** @jsx jsx */
import { Component }           from 'react';
import { jsx, css }            from '@emotion/react';
import { css as cssName }      from '@emotion/css';

import ListItem                from '@mui/material/ListItem';
import ListItemText            from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Typography              from '@mui/material/Typography';
import IconButton              from '@mui/material/IconButton';
import Tooltip                 from '@mui/material/Tooltip';

import Star                    from '@mui/icons-material/Star';
import StarBorder              from '@mui/icons-material/StarBorder';

import RenameDialog            from './RenameDialog.js';
import RemoveDialog            from './RemoveDialog.js';

const styles = theme => ({
    activeItem: {
        backgroundColor: theme.palette.secondary[700],
        '&:hover': {
            backgroundColor: theme.palette.secondary[600]
        }
    },
});

export default class InstancesListItem extends Component {
    static #actionsWidth = '74px';
    render() {
        const { Instance, onSetDefault, onRemove, onSelect, onRename } = this.props;
        return (
            <ListItem button={true}
                      divider={true}
                      disableGutters={true}
                      sx={{py: 1}}
                      component="div"
                      ContainerComponent="div"
                      ContainerProps={{className: cssName({
                          '&       .MuiListItem-secondaryAction':     {paddingRight: '8px'},
                          '&       .MuiListItemSecondaryAction-root': {opacity: 0},
                          '&:hover .MuiListItem-secondaryAction':     {paddingRight: InstancesListItem.#actionsWidth},
                          '&:hover .MuiListItemSecondaryAction-root': {opacity: 1}})}}
                      disabled={!Instance.Valid}
                      onClick={() => onSelect(Instance)}>

                {
                     Instance.Default
                        ?   <Tooltip title="Remove default designation">
                                <span>
                                    <IconButton color="primary"
                                                size="small"
                                                aria-label="Default"
                                                disabled={!Instance.Valid}
                                                onClick={() => onSetDefault(null)}>
                                        <Star/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        :   <Tooltip title="Set default instance">
                                <span>
                                    <IconButton color="primary"
                                                size="small"
                                                aria-label="Not default"
                                                disabled={!Instance.Valid}
                                                onClick={() => onSetDefault(Instance)}>
                                        <StarBorder/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                }

                <ListItemText classes={{primary:   cssName({whiteSpace:   'nowrap',
                                                            overflow:     'hidden',
                                                            textOverflow: 'ellipsis'}),
                                        secondary: cssName({whiteSpace:   'nowrap',
                                                            overflow:     'hidden',
                                                            textOverflow: 'ellipsis'})}}
                              primaryTypographyProps={{variant: 'subtitle2'}}
                              secondaryTypographyProps={{variant: 'caption'}}
                              secondary={Instance.Path}>
                                  { Instance.Name }
                                  <Typography css={css({position: 'absolute',
                                                        top:      12,
                                                        right:    InstancesListItem.#actionsWidth,
                                                        display:  'inline'})}
                                              component="span"
                                              noWrap={true}
                                              color="textSecondary"
                                              variant="caption">
                                        { Instance.Valid
                                            ? `${Instance.Game} ${Instance.Version}`
                                            : '<INVALID>' }
                                  </Typography>
                </ListItemText>
                <ListItemSecondaryAction>
                    <RenameDialog onRename={onRename}
                                  Instance={Instance} />
                    <RemoveDialog onRemove={onRemove}
                                  Instance={Instance} />
                </ListItemSecondaryAction>

            </ListItem>
        );
    }
}
