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
import Button                      from '@mui/material/Button';

import Delete                      from '@mui/icons-material/Delete';
import CloseIcon                   from '@mui/icons-material/Close';

export default class RemoveDialog extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {open: false};
    }

    /**
     * @param {React.MouseEvent} evt
     */
    handleOpen = (evt) => {
        evt.stopPropagation();
        this.setState({open: true});
    }

    /**
     * @param {React.MouseEvent} evt
     */
    handleCancel = (evt) => {
        evt.stopPropagation();
        this.setState({open: false});
    }

    /**
     * @param {React.MouseEvent} evt
     */
    handleRemove = (evt) => {
        evt.stopPropagation();
        this.props.onRemove(this.props.Instance);
        this.setState({open: false});
    }

    render() {
        const { Instance } = this.props;
        const { open     } = this.state;

        return (
            <Fragment>
                <Tooltip title="Remove instance">
                    <IconButton color="primary"
                                size="small"
                                aria-label="Remove"
                                onClick={this.handleOpen}>
                        <Delete/>
                    </IconButton>
                </Tooltip>
                <Dialog open={open}
                        onClose={this.handleCancel}
                        disableRestoreFocus={true}>
                    <DialogTitle>Remove "{Instance.Name}"?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            No files will be deleted on disk.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary"
                                variant="contained"
                                startIcon={<Delete/>}
                                onClick={this.handleRemove}>Remove</Button>
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
