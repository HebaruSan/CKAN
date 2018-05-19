/** @jsx jsx */
import { PureComponent, Fragment } from 'react';
import { jsx, css }                from '@emotion/react';

import filesize                    from 'filesize';

import Box                         from '@mui/material/Box';
import Dialog                      from '@mui/material/Dialog';
import DialogTitle                 from '@mui/material/DialogTitle';
import DialogContent               from '@mui/material/DialogContent';
import Typography                  from '@mui/material/Typography';
import Button                      from '@mui/material/Button';
import Toolbar                     from '@mui/material/Toolbar';
import Paper                       from '@mui/material/Paper';
import Slide                       from '@mui/material/Slide';

import CloseIcon                   from '@mui/icons-material/Close';
import Home                        from '@mui/icons-material/Home';
import CodeIcon                    from '@mui/icons-material/Code';
import AddCircle                   from '@mui/icons-material/AddCircle';
import ArrowUpward                 from '@mui/icons-material/ArrowUpward';
import RemoveCircle                from '@mui/icons-material/RemoveCircle';

import { Scrollbars }              from 'react-custom-scrollbars-2';

import Relationships               from './Relationships.js';
import VersionHistory              from './VersionHistory.js';
import Contents                    from './Contents.js';
import Loading                     from '../../Components/Loading.js';

export default class ModuleDetails extends PureComponent {
    static #sizeFormatter = filesize.partial({round: 1});

    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        /** @type {?object} this.state.details */
        /** @type {?object} this.state.contents */
        this.state = {details:  null,
                      contents: null};
    }

    componentDidMount() {
        this.load();
    }

    load()  {
        if (this.state.details === null) {
            window.ModuleDetails.Get(this.props.module.Identifier, (error, details) => {
                if (error) {
                    alert(error.message + "\n\n" + error.StackTrace);
                } else {
                    this.setState({details});
                }
            });
        }
        if (this.state.contents === null) {
            window.ModuleDetails.GetModuleContents(this.props.module.Identifier, (error, contents) => {
                if (error) {
                    alert(error.message);
                } else {
                    this.setState({contents});
                }
            });
        }
    }

    spacing(multiple) {
        return 8 * multiple;
    }

    render() {
        const { /** @type {?object} */
                details,
                contents } = this.state;
        const { open, module,
                onClose, onInstall, onUpgrade, onRemove } = this.props;

        return (
            <Dialog open={open}
                    onClose={onClose}
                    onClick={evt => evt.stopPropagation()}
                    fullScreen={true}
                    TransitionComponent={Slide}
                    TransitionProps={{direction: 'up'}}
                    disableRestoreFocus={true}>

                <Toolbar css={css({WebkitAppRegion: 'drag',
                                   paddingBottom:   0,
                                   paddingRight:    0,
                                   overflowX:       'hidden'})}>
                    <Button variant="contained"
                            css={css({WebkitAppRegion: 'no-drag',
                                      minWidth:        40})}
                            onClick={onClose}>
                        <CloseIcon/>
                    </Button>

                    <DialogTitle css={css({WebkitAppRegion: 'drag',
                                           paddingBottom:   0,
                                           paddingRight:    0,
                                           overflowX:       'hidden'})}>
                        {
                            module.Name == module.Identifier ? module.Name
                            : module.Name + " (" + module.Identifier + ")"
                        }
                        { module.Authors ? (
                            <Typography>
                                By {module.Authors.join(", ")}
                            </Typography>
                        ) : null }
                        <Box sx={{mt: 1}}>
                            { module.Installable ? (
                                <Button variant="outlined"
                                        color="primary"
                                        sx={{mr: 1}}
                                        css={css({WebkitAppRegion: 'no-drag'})}
                                        startIcon={<AddCircle/>}
                                        onClick={onInstall}>
                                    Install
                                </Button>
                            ) : null }
                            { module.Upgradeable ? (
                                <Button variant="outlined"
                                        color="primary"
                                        sx={{mr: 1}}
                                        css={css({WebkitAppRegion: 'no-drag'})}
                                        startIcon={<ArrowUpward/>}
                                        onClick={onUpgrade}>
                                    Upgrade
                                </Button>
                            ) : null }
                            { (module.Installed && module.Uninstallable) ? (
                                <Button variant="outlined"
                                        color="secondary"
                                        sx={{mr: 1}}
                                        css={css({WebkitAppRegion: 'no-drag'})}
                                        startIcon={<RemoveCircle/>}
                                        onClick={onRemove}>
                                    Uninstall
                                </Button>
                            ) : null }
                        </Box>
                    </DialogTitle>
                </Toolbar>

                <DialogContent css={css({position:   'relative',
                                         paddingTop: 0})}>
                    {
                        details === null ? ( <Loading diameter={256} /> )
                        : (
                            <Fragment>
                                <Box sx={{p: 2, pr: 1, pb: 1}}
                                     css={css({position:      'absolute',
                                               width:         '50%',
                                               height:        '50%',
                                               top:           0,
                                               left:          0})}>
                                    <Paper sx={{p: 2}}
                                        css={css({height: '100%'})}>
                                        <Scrollbars css={css({flexGrow: 1})}>
                                            <Typography variant="caption" paragraph={true}>
                                                {module.Abstract}
                                            </Typography>
                                            <Typography variant="caption" paragraph={true}>
                                                {details.Description}
                                            </Typography>
                                            { details.DownloadSize
                                                ? <Typography paragraph={true}>
                                                    {ModuleDetails.#sizeFormatter(details.DownloadSize)} on {details.DownloadHost}
                                                  </Typography>
                                                : null }
                                            <Typography paragraph={true}>
                                                License: {details.Licenses}
                                            </Typography>
                                            {
                                                details.Homepage ? (
                                                    <Button variant="outlined"
                                                        color="primary"
                                                        sx={{mr: 1}}
                                                        size="small"
                                                        startIcon={<Home/>}>
                                                        Home page
                                                    </Button>
                                                ) : null
                                            } {
                                                details.Repository ? (
                                                    <Button variant="outlined"
                                                        color="secondary"
                                                        sx={{mr: 1}}
                                                        size="small"
                                                        startIcon={<CodeIcon/>}>
                                                        Repository
                                                    </Button>
                                                ) : null
                                            } {
                                                details.Screenshot ? (
                                                    <Box sx={{mt: 1}}>
                                                        <img css={css({width: '95%'})}
                                                             src={details.Screenshot} />
                                                    </Box>
                                                ) : null
                                            }
                                        </Scrollbars>
                                    </Paper>
                                </Box>

                                <Box sx={{p: 2, pl: 1, pb: 1}}
                                     css={css({position: 'absolute',
                                               width:   '50%',
                                               height:  '50%',
                                               top:     0,
                                               right:   0})}>
                                    <Paper sx={{p: 2}}
                                    css={css({height: '100%'})}>
                                        <Scrollbars css={css({flexGrow: 1})}>
                                            <Typography variant="subtitle2" sx={{mb: 1}}>
                                                Version History
                                            </Typography>
                                            <VersionHistory versions={details.Versions} />
                                        </Scrollbars>
                                    </Paper>
                                </Box>

                                <div css={css(details.Relationships ? {position:     'absolute',
                                                                       width:        '50%',
                                                                       height:       '50%',
                                                                       padding:      this.spacing(2),
                                                                       bottom:       0,
                                                                       left:         0,
                                                                       paddingRight: this.spacing(1),
                                                                       paddingTop:   this.spacing(1)}
                                                                    : {position:     'absolute',
                                                                       padding:      this.spacing(2),
                                                                       bottom:       0,
                                                                       left:         0,
                                                                       width:        '100%',
                                                                       height:       '50%',
                                                                       paddingTop:   this.spacing(1)})}>
                                    <Paper css={css({height: '100%',
                                                     padding: this.spacing(2)})}>
                                        <Scrollbars css={css({flexGrow: 1})}>
                                            <Typography variant="subtitle2" css={css({marginBottom: this.spacing(1)})}>
                                                Contents
                                            </Typography>
                                            <Contents contents={contents} />
                                        </Scrollbars>
                                    </Paper>
                                </div>

                                {
                                    details.Relationships ? (
                                        <div css={css({position:    'absolute',
                                                       width:       '50%',
                                                       height:      '50%',
                                                       padding:     this.spacing(2),
                                                       bottom:      0,
                                                       right:       0,
                                                       paddingLeft: this.spacing(1),
                                                       paddingTop:  this.spacing(1)})}>
                                            <Paper css={css({height: '100%',
                                                             padding: this.spacing(2)})}>
                                                <Scrollbars css={css({flexGrow: 1})}>
                                                    <Typography variant="subtitle2" css={css({marginBottom: this.spacing(1)})}>
                                                        Relationships
                                                    </Typography>
                                                    <Relationships module={module}
                                                        relationships={details.Relationships}
                                                        />
                                                </Scrollbars>
                                            </Paper>
                                        </div>
                                    ) : null
                                }
                            </Fragment>
                        )
                    }
                </DialogContent>
            </Dialog>
        );
    }
}
