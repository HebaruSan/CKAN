import React, { PureComponent } from 'react';
import autobind                 from 'class-autobind';

import withStyles           from '@material-ui/core/styles/withStyles';

import Paper                from '@material-ui/core/Paper';
import Tabs                 from '@material-ui/core/Tabs';
import Tab                  from '@material-ui/core/Tab';

const styles = {
    root: {
        flexGrow: 1
    },
    tab: {
        "-webkit-app-region": "no-drag"
    }
};

class ModulesTabs extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
    }

    handleChange(ev, value) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    mkLbl(txt, num) {
        return typeof(num) !== 'undefined' && num !== null
            ? txt + " (" + num + ")"
            : txt;
    }

    handleKeyDown(ev) {
        const { value } = this.props;

        switch (ev.key) {

            case 'Tab':
                if (ev.ctrlKey) {
                    if (ev.shiftKey) {

                        // Ctrl-shift-tab: Backwards through tabs
                        this.handleChange(null,
                              value === 'installed'    ? 'incompatible'
                            : value === 'available'    ? 'installed'
                            : value === 'incompatible' ? 'available'
                            : null);

                    } else {

                        // Ctrl-tab: Forwards through tabs
                        this.handleChange(null,
                              value === 'installed'    ? 'available'
                            : value === 'available'    ? 'incompatible'
                            : value === 'incompatible' ? 'installed'
                            : null);

                    }
                }
                break;

        }
    }

    componentWillMount()   { window.addEventListener(   'keydown', this.handleKeyDown); }
    componentWillUnmount() { window.removeEventListener('keydown', this.handleKeyDown); }

    render() {
        const { classes, installedCount, availableCount, incompatibleCount, value } = this.props;

        return (
            <div className={classes.root}>
                <Tabs centered={true} value={value} onChange={this.handleChange}
                    textColor="secondary">
                    <Tab className={classes.tab} value="installed"    label={this.mkLbl("Installed",   installedCount   )} />
                    <Tab className={classes.tab} value="available"    label={this.mkLbl("Installable", availableCount   )} />
                    <Tab className={classes.tab} value="incompatible" label={this.mkLbl("Other",       incompatibleCount)} />
                </Tabs>
            </div>
        );
    }
}

export default withStyles(styles)(ModulesTabs);
