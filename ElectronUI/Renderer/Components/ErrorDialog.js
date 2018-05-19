/** @jsx jsx */
import { PureComponent } from 'react';
import { jsx, css }      from '@emotion/react';

import Dialog            from '@mui/material/Dialog';
import DialogTitle       from '@mui/material/DialogTitle';
import DialogContent     from '@mui/material/DialogContent';
import Typography        from '@mui/material/Typography';
import DialogActions     from '@mui/material/DialogActions';
import Button            from '@mui/material/Button';

export default class ErrorDialog extends PureComponent {
    render() {
        const { open, title, message, onClose } = this.props;

        return (
            <Dialog open={open}
                    onClose={onClose}
                    disableRestoreFocus={true}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Typography color="error"
                                css={css({whiteSpace: 'pre-wrap'})}>{message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus={true}
                            color="primary"
                            onClick={onClose}>OK</Button>
                </DialogActions>
            </Dialog>
        );
    }
}
