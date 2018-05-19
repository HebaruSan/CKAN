/** @jsx jsx */
import { PureComponent } from 'react';
import { jsx }           from '@emotion/react';

import Drawer            from '@mui/material/Drawer';
import { Scrollbars }    from 'react-custom-scrollbars-2';

import InstancesList     from './InstancesList.js';

export default class InstancesDrawer extends PureComponent {
    static #width = 300;

    render() {
        const { open, onOpen, onClose, onInstanceChange } = this.props;
        return (
            <Drawer variant="persistent"
                    anchor="left"
                    sx={{width: InstancesDrawer.#width}}
                    onClose={onClose}
                    open={open}>
                <Scrollbars style={{marginTop: 2 * 48,
                                    width:     InstancesDrawer.#width}}>
                    <InstancesList style={{width: InstancesDrawer.#width}}
                                   open={open}
                                   onOpen={onOpen}
                                   onBack={onClose}
                                   onInstanceChange={onInstanceChange} />
                </Scrollbars>
            </Drawer>
        );
    }
}
