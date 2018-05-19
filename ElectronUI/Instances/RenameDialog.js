import React, { PureComponent } from 'react';
import autobind                 from 'class-autobind';

import IconButton           from '@material-ui/core/IconButton';
import Tooltip              from '@material-ui/core/Tooltip';
import Dialog               from '@material-ui/core/Dialog';
import DialogTitle          from '@material-ui/core/DialogTitle';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import TextField            from '@material-ui/core/TextField';
import Button               from '@material-ui/core/Button';

import Edit                 from '@material-ui/icons/Edit';

export default class RenameDialog extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            open: false,
            newName: props.Instance.Name
        };
    }

    handleOpen() {
        this.needSelect = true;
        this.setState({
            open:    true,
            newName: this.props.Instance.Name
        });
    }

    handleCancel() {
        this.setState({ open: false });
    }

    handleRename() {
        const fromName = this.props.Instance.Name;
        const toName   = this.state.newName;
        if (fromName !== '' && toName !== '') {
            if (fromName !== toName) {
                this.props.onRename(fromName, toName);
            }
            this.setState({ open: false });
        }
    }

    // Hack to auto-select the contents of the input on open
    componentDidUpdate(_, prev) {
        if (this.needSelect && this.nameField) {
            this.nameField.select();
            this.needSelect = false;
        }
    }

    onKeyPress(ev) {
        if (ev.key === 'Enter') {
            this.handleRename();
            ev.preventDefault();
        }
    }

    render() {
        const { Instance, classes } = this.props;
        const { open, newName } = this.state;
        return (
            <span>
                <Tooltip title="Rename instance">
                    <IconButton className={classes.listButton} color="primary" aria-label="Rename"
                        onClick={this.handleOpen} >
                        <Edit />
                    </IconButton>
                </Tooltip>
                <Dialog open={open} onClose={this.handleCancel} disableRestoreFocus={true}>
                    <DialogTitle>Rename Instance</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Edit the name of the instance.
                        </DialogContentText>
                        <TextField
                            label="Name"
                            inputRef={input => this.nameField = input}
                            autoFocus={true}
                            required={true}
                            margin="dense"
                            fullWidth={true}
                            value={newName}
                            onKeyPress={this.onKeyPress}
                            onChange={ e => this.setState({ newName: e.target.value }) }
                            />
                        <TextField
                            label="Path"
                            disabled={true}
                            margin="dense"
                            fullWidth={true}
                            value={Instance.Path}
                            />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleRename} color="primary">Rename</Button>
                        <Button onClick={this.handleCancel} color="primary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            </span>
        );
    }
}
