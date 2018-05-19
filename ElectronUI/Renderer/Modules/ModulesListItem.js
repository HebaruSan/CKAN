/** @jsx jsx */
import { Component, Fragment } from 'react';
import { jsx, css }            from '@emotion/react';
import { css as cssName }      from '@emotion/css';

import ListItem                from '@mui/material/ListItem';
import ListItemText            from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton              from '@mui/material/IconButton';
import Tooltip                 from '@mui/material/Tooltip';
import Avatar                  from '@mui/material/Avatar';
import ListItemAvatar          from '@mui/material/ListItemAvatar';

import Folder                  from '@mui/icons-material/Folder';
import ArrowUpward             from '@mui/icons-material/ArrowUpward';
import RemoveCircle            from '@mui/icons-material/RemoveCircle';
import AddCircle               from '@mui/icons-material/AddCircle';
import Redo                    from '@mui/icons-material/Refresh';
import Cloud                   from '@mui/icons-material/Cloud';
import CloudOff                from '@mui/icons-material/CloudOff';

import ModuleDetails           from './ModuleDetails/ModuleDetails.js';
import Highlighted,
       { casefold }            from '../Components/Highlighted.js';

const styles = theme => ({
    highlighted: {
        backgroundColor: theme.palette.secondary['A700'],
        color:           theme.palette.getContrastText(theme.palette.secondary['A700']),
    },
});

export default class ModulesListItem extends Component {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {detailsOpen: false};
    }

    handleReinstall = () => {
        alert("REINSTALL " + this.props.module.Identifier);
    }

    handleRemove = () => {
        alert("UNINSTALL " + this.props.module.Identifier);
    }

    handleInstall = () => {
        alert("INSTALL " + this.props.module.Identifier);
    }

    handleUpgrade = () => {
        alert("UPGRADE " + this.props.module.Identifier);
    }

    onClick = () => {
        const {onClicked} = this.props;
        // Let the parent know we're going to show the details
        if (onClicked)
            onClicked();
        this.toggleDetails();
    }

    toggleDetails = () => {
        this.setState({detailsOpen: !this.state.detailsOpen});
    }

    static #hlClass = cssName({backgroundColor: '#ffea00',
                               color:           '#000',
                               borderRadius:    3,
                               boxShadow:       '0 0 1px 2px #ffea00'});

    /**
     * @param {string[]} authors
     * @param {string} searchFor
     * @returns {(string|jsx.JSX.Element)[]}
     */
    highlightAuthors(authors, searchFor) {
        if (searchFor.length <= 1 || !searchFor.startsWith("@"))
            // Not an author search, just put commas between them
            return authors.flatMap(a => [', ', a]).slice(1);
        else {
            const authorSearch = casefold(searchFor.substring(1));
            return authors.flatMap(a => casefold(a).startsWith(authorSearch)
                                        ? [', ',
                                           <span key={a}
                                                 className={ModulesListItem.#hlClass}>
                                                {a.substring(0, authorSearch.length)}
                                           </span>,
                                           a.substring(authorSearch.length)]
                                        : [', ', a])
                          .slice(1);
        }
    }

    render() {
        const { style, module, Search, onInstall, onUninstall, onUpgrade } = this.props;
        const { detailsOpen } = this.state;

        return (
            <div style={style}>

                <ListItem button={true}
                          component="div"
                          ContainerComponent="div"
                          ContainerProps={{className: cssName({
                              '& .MuiListItemSecondaryAction-root': {
                                  opacity: 0
                              },
                              '&:hover .MuiListItemSecondaryAction-root': {
                                  opacity: 1
                              }
                          })}}
                          onClick={this.onClick}>

                    <ListItemAvatar>
                        <Avatar>{ module.Installed   ? <Folder/>
                                : module.Installable ? <Cloud/>
                                :                      <CloudOff/>}</Avatar>
                    </ListItemAvatar>

                    <ListItemText css={css({flex: 1})}
                        classes={{primary:   cssName({whiteSpace:   'nowrap',
                                                      overflow:     'hidden',
                                                      textOverflow: 'ellipsis'}),
                                  secondary: cssName({whiteSpace:   'nowrap',
                                                      overflow:     'hidden',
                                                      textOverflow: 'ellipsis'})}}
                        secondary={<Highlighted Content={module.Abstract}
                                                Search={Search}
                                                HighlightClassName={ModulesListItem.#hlClass}
                                                />}>
                        {
                            module.Name === module.Identifier
                                ? <Highlighted Content={module.Name}
                                               Search={Search}
                                               HighlightClassName={ModulesListItem.#hlClass}
                                               />
                                : [<Highlighted key="name"
                                                Content={module.Name}
                                                Search={Search}
                                                HighlightClassName={ModulesListItem.#hlClass}
                                                />,
                                   ' (',
                                   <Highlighted key="ident"
                                                Content={module.Identifier}
                                                Search={Search}
                                                HighlightClassName={ModulesListItem.#hlClass}
                                                />,
                                   ')']
                        } {
                            [' ', module.Version]
                        } {
                            module.Authors
                                ? [' by ', ...this.highlightAuthors(module.Authors, Search)]
                                : []
                        }
                    </ListItemText>

                    <ListItemSecondaryAction>
                        {
                            module.Upgradeable ? (
                                <Tooltip title="Upgrade">
                                    <IconButton size="small"
                                                color="secondary"
                                                onClick={this.handleUpgrade}>
                                        <ArrowUpward/>
                                    </IconButton>
                                </Tooltip>
                            ) : ''
                        } {
                            (module.Installed && module.Uninstallable) ? (
                                <Fragment>
                                    <Tooltip title="Reinstall">
                                        <IconButton size="small"
                                                    color="secondary"
                                                    onClick={this.handleReinstall}>
                                            <Redo/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Uninstall">
                                        <IconButton size="small"
                                                    color="secondary"
                                                    onClick={this.handleRemove}>
                                            <RemoveCircle/>
                                        </IconButton>
                                    </Tooltip>
                                </Fragment>)
                            : module.Installable ? (
                                <Tooltip title="Install">
                                    <IconButton size="small"
                                                color="secondary"
                                                onClick={this.handleInstall}>
                                        <AddCircle/>
                                    </IconButton>
                                </Tooltip>
                            ) : ''
                        }
                        <ModuleDetails module={module}
                                       open={detailsOpen}
                                       onClose={this.toggleDetails}
                                       onRemove={this.handleRemove}
                                       onInstall={this.handleInstall}
                                       onReinstall={this.handleReinstall}
                                       onUpgrade={this.handleUpgrade}
                                       />
                    </ListItemSecondaryAction>
                </ListItem>

            </div>
        );
    }
}
