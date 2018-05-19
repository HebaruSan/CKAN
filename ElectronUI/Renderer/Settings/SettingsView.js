/** @jsx jsx */
import { PureComponent } from 'react';
import { jsx }           from '@emotion/react';

import Dialog            from '@mui/material/Dialog';
import DialogTitle       from '@mui/material/DialogTitle';
import DialogActions     from '@mui/material/DialogActions';
import DialogContent     from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField         from '@mui/material/TextField';
import Button            from '@mui/material/Button';
import Zoom              from '@mui/material/Zoom';
import InputAdornment    from '@mui/material/InputAdornment';

import CloseIcon         from '@mui/icons-material/Close';
import Check             from '@mui/icons-material/Check';

export default class SettingsView extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {
            refreshInterval: props.Settings.refreshInterval,
        };
    }

    /*
    componentWillReceiveProps(nextProps) {
        if (nextProps.open && !this.props.open) {
            this.setState({
                refreshInterval: nextProps.Settings.refreshInterval,
            });
        }
    }
    */

    accept = () => {
        const {refreshInterval} = this.state;
        window.main.setSetting('refreshInterval', refreshInterval);
        this.props.onClose();
    }

    cancel = () => {
        this.props.onClose();
    }

    render() {
        const { open            } = this.props;
        const { refreshInterval } = this.state;

         return (
            <Dialog open={open}
                TransitionComponent={Zoom}
                disableRestoreFocus={true}>
                <DialogTitle>Settings</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Edit your CKAN configuration.
                    </DialogContentText>

                    <TextField label="Auto refresh interval"
                        value={refreshInterval}
                        autoFocus={true}
                        onChange={ ev => this.setState({ refreshInterval: ev.target.value }) }
                        type="number"
                        InputProps={{
                            endAdornment: <InputAdornment position="end">minutes</InputAdornment>
                        }}
                        />

                </DialogContent>
                <DialogActions>
                    <Button variant="contained"
                            color="primary"
                            startIcon={<Check/>}
                            onClick={this.accept}>
                        Accept
                    </Button>
                    <Button variant="contained"
                            color="secondary"
                            startIcon={<CloseIcon/>}
                            onClick={this.cancel}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
