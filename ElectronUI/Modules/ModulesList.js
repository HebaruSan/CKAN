import React, { PureComponent } from 'react';
import autobind                 from 'class-autobind';
import { remote }           from 'electron';
const { dialog } = remote;
import classNames           from 'classnames';

import withStyles           from '@material-ui/core/styles/withStyles';

import Typography           from '@material-ui/core/Typography';
import Modal                from '@material-ui/core/Modal';

import { List as VirtualizedList,
         AutoSizer, CellMeasurer,
         CellMeasurerCache } from 'react-virtualized';

import ModulesListItem      from './ModulesListItem.js';
import Loading              from '../main/Loading.js';

const styles = {
    modList: {
        // We rely on parent to set top via className
        position: 'fixed',
        left:     0,
        right:    0,
        bottom:   0,
        overflow: 'auto',
    },
    message: {
        position: 'absolute',
        top:  '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
};

class ModulesList extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
        this.measurerCache = new CellMeasurerCache({
            defaultWidth: 1000,
            minWidth:     100,
            fixedHeight:  true
        });
    }

    getKey() {
        const { Filter, Search } = this.props;
        return Filter + "-" + Search;
    }

    mkRow({ key, index, isScrolling, isVisible, style, parent }) {
        const { Search, Modules } = this.props;
        const module = Modules[index];

        return (
            <CellMeasurer cache={this.measurerCache} key={module.Identifier} parent={parent} rowIndex={index}>
                <ModulesListItem style={style} module={module} Search={Search} />
            </CellMeasurer>
        );
    }

    render() {
        const { classes, className, Modules, Refreshing } = this.props;

        // TODO: Custom scrollbars

        if (this.props.Instance === null) {
            return (
                <div className={classNames(className, classes.modList)}>
                    <Typography color="secondary" variant="display1" className={classes.message}>
                        Select an instance
                    </Typography>
                </div>
            );
        } else if (!Modules) {
            return (
                <Loading diameter={256} />
            );
        } else if (Modules.length === 0) {
            return (
                <div className={classNames(className, classes.modList)}>
                    <Typography color="secondary" variant="display1" className={classes.message}>
                        No modules found
                    </Typography>
                </div>
            );
        } else {
            return (
                <div className={classNames(className, classes.modList)}>
                    <Modal open={Refreshing} disableAutoFocus={true}>
                        <Loading text="Refreshing..."
                            diameter={256}
                            opaque={true}
                            />
                    </Modal>
                    <AutoSizer>{
                        ({ height, width }) => (
                            <VirtualizedList
                                key={this.getKey()}
                                deferredMeasurementCache={this.measurerCache}
                                height={height}
                                width={width}
                                rowCount={Modules.length}
                                rowHeight={64}
                                rowRenderer={this.mkRow}
                                />
                        )
                    }</AutoSizer>
                </div>
            );
        }
    }
}

export default withStyles(styles)(ModulesList);
