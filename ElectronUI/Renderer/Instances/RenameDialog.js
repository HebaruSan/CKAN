/** @jsx jsx */
import { Fragment, PureComponent } from 'react';
import { jsx }                     from '@emotion/react';

import IconButton                  from '@mui/material/IconButton';
import Tooltip                     from '@mui/material/Tooltip';
import Dialog                      from '@mui/material/Dialog';
import DialogTitle                 from '@mui/material/DialogTitle';
import DialogActions               from '@mui/material/DialogActions';
import DialogContent               from '@mui/material/DialogContent';
import DialogContentText           from '@mui/material/DialogContentText';
import TextField                   from '@mui/material/TextField';
import Button                      from '@mui/material/Button';

import Edit                        from '@mui/icons-material/Edit';
import CloseIcon                   from '@mui/icons-material/Close';

export default class RenameDialog extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {open:    false,
                      newName: props.Instance.Name};
    }

    /**
     * @param {React.MouseEvent} evt
     */
    handleOpen = evt => {
        evt.stopPropagation();
        this.needSelect = true;
        this.setState({open:    true,
                       newName: this.props.Instance.Name});
    }

    /**
     * @param {React.MouseEvent} evt
     */
    handleCancel = evt => {
        evt.stopPropagation();
        this.setState({open: false});
    }

    /**
     * @param {React.MouseEvent} evt
     */
    handleRename = evt => {
        evt.stopPropagation();
        this.renameAndClose();
    }

    // Hack to auto-select the contents of the input on open
    componentDidUpdate(_, prev) {
        if (this.needSelect && this.nameField) {
            this.nameField.select();
            this.needSelect = false;
        }
    }

    /**
     * @param {React.KeyboardEvent<HTMLDivElement>} evt
     */
    onKeyPress = evt => {
        if (evt.key === 'Enter') {
            evt.preventDefault();
            this.renameAndClose();
        }
    }

    renameAndClose() {
        const fromName = this.props.Instance.Name;
        const toName   = this.state.newName;
        if (fromName !== '' && toName !== '') {
            if (fromName !== toName)
                this.props.onRename(fromName, toName);
            this.setState({open: false});
        }
    }

    render() {
        const { Instance } = this.props;
        const { open, newName } = this.state;
        return (
            <Fragment>
                <Tooltip title="Rename instance">
                    <IconButton color="primary"
                                size="small"
                                aria-label="Rename"
                                onClick={this.handleOpen}>
                        <Edit/>
                    </IconButton>
                </Tooltip>
                <Dialog open={open}
                        onClose={this.handleCancel}
                        disableRestoreFocus={true}>
                    <DialogTitle>Rename Instance</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Edit the name of the instance.
                        </DialogContentText>
                        <TextField label="Name"
                                   inputRef={input => this.nameField = input}
                                   autoFocus={true}
                                   required={true}
                                   margin="dense"
                                   fullWidth={true}
                                   value={newName}
                                   onKeyPress={this.onKeyPress}
                                   onChange={e => this.setState({newName: e.target.value})}
                                   />
                        <TextField label="Path"
                                   disabled={true}
                                   margin="dense"
                                   fullWidth={true}
                                   value={Instance.Path}
                                   />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary"
                                variant="contained"
                                startIcon={<Edit/>}
                                onClick={this.handleRename}>Rename</Button>
                        <Button color="primary"
                                variant="text"
                                startIcon={<CloseIcon/>}
                                onClick={this.handleCancel}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}
