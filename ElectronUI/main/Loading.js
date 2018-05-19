import React, { PureComponent, Fragment } from 'react';
import classNames           from 'classnames';

import withStyles           from '@material-ui/core/styles/withStyles';

import Fade                 from '@material-ui/core/Fade';
import CircularProgress     from '@material-ui/core/CircularProgress';
import Typography           from '@material-ui/core/Typography';
import Paper                from '@material-ui/core/Paper';

const styles = {
    fadeIn: {
        transitionDelay: 0.8
    },
    loading: {
        position: 'absolute',
        top:  '50%',
        left: '50%',
        textAlign:      'center',
        verticalAlign:  'middle',
        alignItems:     'center',
        justifyContent: 'center',
    },
    loadingText: {
        position: 'absolute',
        top:  '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    },
};

class Loading extends PureComponent {
    constructor(props) {
        super(props);

        const { diameter } = this.props;

        this.floatStyle = {
            width:        diameter,
            height:       diameter,
            marginLeft:  -diameter / 2,
            marginTop:   -diameter / 2,
            borderRadius: diameter / 2,
        };
    }

    render() {
        const { classes, diameter, opaque, text } = this.props;

        const inner = (
            <Fragment>
                <Fade in={true}
                    className={classNames(classes.fadeIn, classes.loading)}
                    style={this.floatStyle}>
                    <CircularProgress color="primary" variant="indeterminate"
                        size={diameter} thickness={5}
                        />
                </Fade>
                <Typography color="secondary" variant="display1"
                    className={classes.loadingText}>
                    { text ? text : "Loading..." }
                </Typography>
            </Fragment>
        );

        return opaque ? (
            <Paper className={classes.loading} style={this.floatStyle}>
                {inner}
            </Paper>
        ) : inner;
    }
}

export default withStyles(styles)(Loading);
