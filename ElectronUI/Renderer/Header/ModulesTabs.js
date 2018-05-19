/** @jsx jsx */
import { PureComponent } from 'react';
import { jsx, css }      from '@emotion/react';

import Tabs              from '@mui/material/Tabs';
import Tab               from '@mui/material/Tab';

export default class ModulesTabs extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
    }

    /**
     * @param {?React.SyntheticEvent} evt
     * @param {?string} value
     */
    handleChange = (evt, value) => {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    /**
     * @param {string} txt
     * @param {?string} num
     */
    mkLbl(txt, num) {
        return typeof(num) !== 'undefined' && num !== null
            ? txt + " (" + num + ")"
            : txt;
    }

    /**
     * @param {KeyboardEvent} evt
     */
    handleKeyDown = evt => {
        const { value } = this.props;

        switch (evt.key) {

            case 'Tab':
                if (evt.ctrlKey) {
                    if (evt.shiftKey) {

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

    componentDidMount()    { window.addEventListener(   'keydown', this.handleKeyDown); }
    componentWillUnmount() { window.removeEventListener('keydown', this.handleKeyDown); }

    render() {
        const { installedCount, availableCount, incompatibleCount, value } = this.props;

        return (
            <div css={css({flexGrow: 1})}>
                <Tabs centered={true}
                      value={value}
                      textColor="secondary"
                      onChange={this.handleChange}>
                    <Tab css={css({WebkitAppRegion: 'no-drag'})} value="installed"    label={this.mkLbl("Installed",   installedCount   )} />
                    <Tab css={css({WebkitAppRegion: 'no-drag'})} value="available"    label={this.mkLbl("Installable", availableCount   )} />
                    <Tab css={css({WebkitAppRegion: 'no-drag'})} value="incompatible" label={this.mkLbl("Other",       incompatibleCount)} />
                </Tabs>
            </div>
        );
    }
}
