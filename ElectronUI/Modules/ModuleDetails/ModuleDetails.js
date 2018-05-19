import React, { PureComponent, Fragment } from 'react';
import autobind             from 'class-autobind';
import classNames           from 'classnames';
import { shell }            from 'electron';

import filesize             from 'filesize';

import withStyles           from '@material-ui/core/styles/withStyles';

import Dialog               from '@material-ui/core/Dialog';
import DialogTitle          from '@material-ui/core/DialogTitle';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import Typography           from '@material-ui/core/Typography';
import DialogActions        from '@material-ui/core/DialogActions';
import Button               from '@material-ui/core/Button';
import IconButton           from '@material-ui/core/IconButton';
import Tooltip              from '@material-ui/core/Tooltip';
import Toolbar              from '@material-ui/core/Toolbar';
import Paper                from '@material-ui/core/Paper';
import Grid                 from '@material-ui/core/Grid';
import Slide                from '@material-ui/core/Slide';

import CloseIcon            from '@material-ui/icons/Close';
import Home                 from '@material-ui/icons/Home';
import Info                 from '@material-ui/icons/Info';
import CodeIcon             from '@material-ui/icons/Code';
import AddCircle            from '@material-ui/icons/AddCircle';
import FileDownload         from '@material-ui/icons/FileDownload';
import ArrowUpward          from '@material-ui/icons/ArrowUpward';
import RemoveCircle         from '@material-ui/icons/RemoveCircle';

import { Scrollbars }       from 'react-custom-scrollbars';

import DetailsService       from './DetailsService.js';
import Relationships        from './Relationships.js';
import VersionHistory       from './VersionHistory.js';
import Contents             from './Contents.js';
import Loading              from '../../main/Loading.js';

const buttonWidth = 36;

const styles = theme => ({
    title: {
        "-webkit-app-region": "drag",
        paddingBottom: 0,
        paddingRight:  0,
        overflowX: 'hidden',
    },
    listButton: {
        width:        buttonWidth,
        height:       buttonWidth,
        marginLeft:  -buttonWidth / 6,
        marginRight: -buttonWidth / 6,
    },
    closeBtn: {
        "-webkit-app-region": "no-drag",
        minWidth: 40,
    },
    titleBtn: {
        "-webkit-app-region": "no-drag",
        marginRight: theme.spacing.unit,
    },
    detailActions: {
        marginTop: theme.spacing.unit,
    },

    dialogContent: {
        position:   'relative',
        paddingTop: 0,
    },
    pane: {
        position: 'absolute',
        width:    '50%',
        height:   '50%',
        padding:  2 * theme.spacing.unit,
    },
    topLeft: {
        top:  0,
        left: 0,
        paddingRight:  theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    topRight: {
        top:   0,
        right: 0,
        paddingLeft:   theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    bottomLeft: {
        bottom:  0,
        left:    0,
        paddingRight: theme.spacing.unit,
        paddingTop:   theme.spacing.unit,
    },
    bottomRight: {
        bottom:  0,
        right:   0,
        paddingLeft: theme.spacing.unit,
        paddingTop:  theme.spacing.unit,
    },
    bottom: {
        bottom:  0,
        left:    0,
        width:  '100%',
        height: '50%',
        paddingTop: theme.spacing.unit,
    },
    paper: {
        backgroundColor: theme.palette.background[300],
        height: '100%',
        padding: 2 * theme.spacing.unit,
    },

    scrollBars: {
        flexGrow: 1,
    },
    subhead: {
        marginBottom: theme.spacing.unit,
    },
    btn: {
        marginRight: theme.spacing.unit,
    },
    btnIcon: {
        marginRight: 0.5 * theme.spacing.unit,
        witdth: 16,
        height: 16,
    },
    screenshot: {
        width: '95%',
        marginTop: theme.spacing.unit,
    },
});

class ModuleDetails extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            details:  null,
            contents: null,
        };
        this.slideProps = {
            direction: 'up',
        };
    }

    handleOpen()  {
        var svc = null;
        if (this.state.details === null) {
            if (svc === null) {
                svc = new DetailsService();
            }
            svc.Get(this.props.module.Identifier, (error, details) => {
                if (error) {
                    alert(error.message + "\n\n" + error.StackTrace);
                } else {
                    this.setState({ details: details });
                }
            });
        }
        if (this.state.contents === null) {
            if (svc === null) {
                svc = new DetailsService();
            }
            svc.GetModuleContents(this.props.module.Identifier, (error, contents) => {
                if (error) {
                    alert(error.message);
                } else {
                    this.setState({ contents: contents });
                }
            });
        }
    }

    render() {
        const { details, contents } = this.state;
        const { open, classes, module, onInstall, onUpgrade, onRemove } = this.props;

        if (open) {
            this.handleOpen();
        }

        return (
            <Dialog open={open}
                className={classes.dialog}
                onClose={this.props.onClose}
                onClick={ev => ev.stopPropagation()}
                fullScreen={true}
                TransitionComponent={Slide}
                TransitionProps={this.slideProps}
                disableRestoreFocus={true}>

                <Toolbar className={classes.title}>
                    <Button variant="fab" mini={true}
                        className={classes.closeBtn}
                        onClick={this.props.onClose}>
                        <CloseIcon />
                    </Button>

                    <DialogTitle className={classes.title}>
                        {
                            module.Name == module.Identifier ? module.Name
                            : module.Name + " (" + module.Identifier + ")"
                        }
                        { module.Authors ? (
                            <Typography>
                                    By {module.Authors.join(", ")}
                            </Typography>
                        ) : null }
                        <div className={classes.detailActions}>
                            { module.Installable ? (
                                <Button variant="raised" color="primary"
                                    onClick={onInstall}
                                    className={classes.titleBtn}>
                                    <AddCircle className={classes.btnIcon} />
                                    Install
                                </Button>
                            ) : null }
                            { module.Upgradeable ? (
                                <Button variant="raised" color="primary"
                                    onClick={onUpgrade}
                                    className={classes.titleBtn}>
                                    <ArrowUpward className={classes.btnIcon} />
                                    Upgrade
                                </Button>
                            ) : null }
                            { module.Installed ? (
                                <Button variant="raised" color="secondary"
                                    onClick={onRemove}
                                    className={classes.titleBtn}>
                                    <RemoveCircle className={classes.btnIcon} />
                                    Uninstall
                                </Button>
                            ) : null }
                        </div>
                    </DialogTitle>
                </Toolbar>

                <DialogContent className={classes.dialogContent}>
                    {
                        details === null ? ( <Loading diameter={256} /> )
                        : (
                            <Fragment>
                                <div className={classNames(classes.pane, classes.topLeft)}>
                                    <Paper className={classes.paper}>
                                        <Scrollbars className={classes.scrollBars}>
                                            <Typography variant="caption" paragraph={true}>
                                                {module.Abstract}
                                            </Typography>
                                            <Typography variant="caption" paragraph={true}>
                                                {details.Description}
                                            </Typography>
                                            <Typography paragraph={true}>
                                                {filesize(details.DownloadSize)} on {details.DownloadHost}
                                            </Typography>
                                            <Typography paragraph={true}>
                                                License: {details.Licenses}
                                            </Typography>
                                            {
                                                details.Homepage ? (
                                                    <Button variant="outlined"
                                                        color="primary"
                                                        className={classes.btn}
                                                        size="small"
                                                        onClick={() => shell.openExternal(details.Homepage)}>
                                                        <Home className={classes.btnIcon} />
                                                        Home page
                                                    </Button>
                                                ) : null
                                            } {
                                                details.Repository ? (
                                                    <Button variant="outlined"
                                                        color="secondary"
                                                        className={classes.btn}
                                                        size="small"
                                                        onClick={() => shell.openExternal(details.Repository)}>
                                                        <CodeIcon className={classes.btnIcon} />
                                                        Repository
                                                    </Button>
                                                ) : null
                                            } {
                                                details.Screenshot ? (
                                                    <img className={classes.screenshot} src={details.Screenshot} />
                                                ) : null
                                            }
                                        </Scrollbars>
                                    </Paper>
                                </div>

                                <div className={classNames(classes.pane, classes.topRight)}>
                                    <Paper className={classes.paper}>
                                        <Scrollbars className={classes.scrollBars}>
                                            <Typography variant="subheading" className={classes.subhead}>
                                                Version History
                                            </Typography>
                                            <VersionHistory versions={details.Versions} />
                                        </Scrollbars>
                                    </Paper>
                                </div>

                                <div className={classNames(classes.pane, details.Relationships ? classes.bottomLeft : classes.bottom)}>
                                    <Paper className={classes.paper}>
                                        <Scrollbars className={classes.scrollBars}>
                                            <Typography variant="subheading" className={classes.subhead}>
                                                Contents
                                            </Typography>
                                            <Contents contents={contents} />
                                        </Scrollbars>
                                    </Paper>
                                </div>

                                {
                                    details.Relationships ? (
                                        <div className={classNames(classes.pane, classes.bottomRight)}>
                                            <Paper className={classes.paper}>
                                                <Scrollbars className={classes.scrollBars}>
                                                    <Typography variant="subheading" className={classes.subhead}>
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

export default withStyles(styles)(ModuleDetails);
