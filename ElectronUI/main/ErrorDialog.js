import React, { PureComponent } from 'react';

import withStyles           from '@material-ui/core/styles/withStyles';

import Dialog               from '@material-ui/core/Dialog';
import DialogTitle          from '@material-ui/core/DialogTitle';
import DialogContent        from '@material-ui/core/DialogContent';
import Typography           from '@material-ui/core/Typography';
import DialogActions        from '@material-ui/core/DialogActions';
import Button               from '@material-ui/core/Button';

const styles = {
    message: {
        whiteSpace: 'pre-wrap',
    },
};

class ErrorDialog extends PureComponent {
    render() {
        const { classes, open, title, message } = this.props;

        return (
            <Dialog open={open} onClose={this.props.onClose} disableRestoreFocus={true}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Typography color="error" className={classes.message}>{message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus={true} onClick={this.props.onClose} color="primary">OK</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withStyles(styles)(ErrorDialog);
