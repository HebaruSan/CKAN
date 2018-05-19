import React, { PureComponent } from 'react';
import autobind             from 'class-autobind';

import IconButton           from '@material-ui/core/IconButton';
import Tooltip              from '@material-ui/core/Tooltip';
import Dialog               from '@material-ui/core/Dialog';
import DialogTitle          from '@material-ui/core/DialogTitle';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import Button               from '@material-ui/core/Button';

import Delete               from '@material-ui/icons/Delete';

export default class RemoveDialog extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            open: false
        };
    }

    handleOpen()   { this.setState({ open: true  }); }
    handleCancel() { this.setState({ open: false }); }

    handleRemove() {
        this.props.onRemove(this.props.Instance);
        this.handleClose();
    }

    render() {
        const { classes, Instance } = this.props;
        const { open              } = this.state;

        return (
            <span>
                <Tooltip title="Remove instance">
                    <IconButton className={classes.listButton} color="primary" aria-label="Remove"
                        onClick={this.handleOpen} >
                        <Delete/>
                    </IconButton>
                </Tooltip>
                <Dialog open={open} onClose={this.handleCancel} disableRestoreFocus={true}>
                    <DialogTitle>Remove "{Instance.Name}"?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            No files will be deleted on disk.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleRemove} color="primary">Remove</Button>
                        <Button onClick={this.handleCancel} color="primary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            </span>
        );
    }
}
