import React, { PureComponent }    from 'react';
import { remote }           from 'electron';
const { dialog } = remote;
import os                   from 'os';
import ReactDOM             from 'react-dom';
import PropTypes            from 'prop-types';
import classNames           from 'classnames';

import withStyles           from '@material-ui/core/styles/withStyles';

import Drawer               from '@material-ui/core/Drawer';

import InstancesList        from './InstancesList.js';

const drawerWidth = 320;

const styles = theme => ({
    drawerPaper: {
        // We rely on parent to set top via className
        left:   0,
        bottom: 0,
        width:  drawerWidth,
        // The Drawer class sets these by default, and they mess up our layout
        right:  'auto',
        height: 'auto',
    }
});

class InstancesDrawer extends PureComponent {
    constructor(props) {
        super(props);

        this.paperClass = {
            paper: classNames(this.props.className, this.props.classes.drawerPaper)
        };
    }

    render() {
        const { classes, className, open, onOpen, onClose, onInstanceChange } = this.props;

        return (
            <Drawer variant="persistent" anchor="left"
                className={className}
                classes={this.paperClass}
                open={open}>
                <InstancesList open={open}
                    onOpen={onOpen}
                    onBack={onClose}
                    onInstanceChange={onInstanceChange} />
            </Drawer>
        );
    }
}

export default withStyles(styles)(InstancesDrawer);
