import React, { PureComponent } from 'react';
import autobind                 from 'class-autobind';

import withStyles           from '@material-ui/core/styles/withStyles';

import List                 from '@material-ui/core/List';
import ListItem             from '@material-ui/core/ListItem';
import ListItemIcon         from '@material-ui/core/ListItemIcon';
import ListItemText         from '@material-ui/core/ListItemText';
import ListSubheader        from '@material-ui/core/ListSubheader';
import Typography           from '@material-ui/core/Typography';
import Button               from '@material-ui/core/Button';

import FileDownload         from '@material-ui/icons/FileDownload';

import Loading              from '../../main/Loading.js';

const styles = {
    file: {
        paddingTop:    1,
        paddingBottom: 1
    },
};

class Contents extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
    }

    handleDownload() {
        // TODO
        alert("DOWNLOAD");
    }

    render() {
        const { contents, classes } = this.props;

        return (
            contents ? (
                contents.length > 0 ? (
                    <List dense={true} disablePadding={true}>
                        { contents.map(file => (
                            <ListItem disableTypography={true} dense={true} className={classes.file}>
                                <ListItemText dense={true}>
                                    <Typography variant="caption" noWrap={true}>
                                        {file}
                                    </Typography>
                                </ListItemText>
                            </ListItem>
                        )) }
                    </List>
                ) : (
                    <Button variant="raised" color="secondary"
                        fullWidth={true} size="large"
                        onClick={this.handleDownload}>
                        <FileDownload />
                        Download
                    </Button>
                )
            ) : (
                <Loading diameter={128} text="Unzipping..." />
            )
        );
    }
}

export default withStyles(styles)(Contents);
