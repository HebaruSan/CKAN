import React, { PureComponent } from 'react';
import autobind                 from 'class-autobind';

import NumberFormat         from 'react-number-format';

import Dialog               from '@material-ui/core/Dialog';
import DialogTitle          from '@material-ui/core/DialogTitle';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import TextField            from '@material-ui/core/TextField';
import Button               from '@material-ui/core/Button';
import Zoom                 from '@material-ui/core/Zoom';
import InputAdornment       from '@material-ui/core/InputAdornment';

import CloseIcon            from '@material-ui/icons/Close';
import Check                from '@material-ui/icons/Check';

export default class SettingsView extends PureComponent {
	constructor(props) {
		super(props);
		autobind(this);
		this.state = {
			refreshInterval: props.Settings.refreshInterval,
		};
		this.minutesInputProps = {
			inputComponent: NumberFormat,
			endAdornment:   <InputAdornment position="end">minutes</InputAdornment>,
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.open && !this.props.open) {
			this.setState({
				refreshInterval: nextProps.Settings.refreshInterval,
			});
		}
	}

	accept() {
		const { Settings } = this.props;
		for (var prop in this.state) {
			Settings[prop] = this.state[prop];
		}
		Settings.notifyListeners();
		this.props.onClose();
	}

	cancel() {
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
						InputProps={this.minutesInputProps}
						/>

				</DialogContent>
				<DialogActions>
					<Button variant="raised"
						color="primary"
						onClick={this.accept}>
						<Check />
						Accept
					</Button>
					<Button variant="raised"
						color="secondary"
						onClick={this.cancel}>
						<CloseIcon />
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		);
	}
}
