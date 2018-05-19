/** @jsx jsx */
import { PureComponent }        from 'react';
import { jsx, css }             from '@emotion/react';

import Typography               from '@mui/material/Typography';
import Modal                    from '@mui/material/Modal';

import { List as VirtualizedList,
         AutoSizer, CellMeasurer,
         CellMeasurerCache }    from '@enykeev/react-virtualized';

import ModulesListItem          from './ModulesListItem.js';
import Loading                  from '../Components/Loading.js';

export default class ModulesList extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.measurerCache = new CellMeasurerCache({
            defaultWidth: 1000,
            minWidth:     100,
            fixedHeight:  true
        });
    }

    getKey = () => {
        const { Filter, Search } = this.props;
        return Filter + "-" + Search;
    }

    mkRow = ({index, style, parent}) => {
        const { Search, Modules, onModuleClicked } = this.props;
        const module = Modules[index];

        return (
            <CellMeasurer cache={this.measurerCache}
                          key={module.Identifier}
                          parent={parent}
                          rowIndex={index}>
                <ModulesListItem style={style}
                                 module={module}
                                 Search={Search}
                                 onClicked={onModuleClicked}
                                 />
            </CellMeasurer>
        );
    }

    render() {
        const { Instance, Modules, Refreshing } = this.props;

        // TODO: Custom scrollbars

        if (Instance === null) {
            return (
                <div css={css({position: 'fixed',
                               top:      2 * 48,
                               left:     0,
                               right:    0,
                               bottom:   0,
                               overflow: 'auto'})}>
                    <Typography color="secondary" variant="subtitle1"
                        css={css({position:  'absolute',
                                  top:       '50%',
                                  left:      '50%',
                                  transform: 'translate(-50%, -50%)'})}>
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
                <div css={css({position: 'fixed',
                               top:      2 * 48,
                               left:     0,
                               right:    0,
                               bottom:   0,
                               overflow: 'auto'})}>
                    <Typography color="secondary"
                                variant="subtitle1"
                                css={css({position:  'absolute',
                                          top:       '50%',
                                          left:      '50%',
                                          transform: 'translate(-50%, -50%)'})}>
                        No modules found
                    </Typography>
                </div>
            );
        } else {
            return (
                <div css={css({position: 'fixed',
                               top:      2 * 48,
                               left:     0,
                               right:    0,
                               bottom:   0,
                               overflow: 'auto'})}>
                    <Modal open={Refreshing} disableAutoFocus={true}>
                        <Loading text="Refreshing..."
                                 diameter={256}
                                 opaque={true}
                                 />
                    </Modal>
                    {
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
                    }
                </div>
            );
        }
    }
}
