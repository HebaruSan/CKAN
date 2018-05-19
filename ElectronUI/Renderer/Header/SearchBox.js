/** @jsx jsx */
import { PureComponent }  from 'react';
import { jsx, css }       from '@emotion/react';
import { css as cssName } from '@emotion/css';

import IconButton         from '@mui/material/IconButton';
import Input              from '@mui/material/Input';
import InputAdornment     from '@mui/material/InputAdornment';
import Paper              from '@mui/material/Paper';

import SearchIcon         from '@mui/icons-material/Search';
import ClearIcon          from '@mui/icons-material/Clear';

// Inspired by https://github.com/TeamWertarbyte/material-ui-search-bar
// Borrowing selectively because I don't trust Node dependencies.
// I hope that's allowed by the MIT license.
// Modified to mimic the search box on https://material-ui.com/api/

const blurredWidth = 200;
const focusedWidth = 250;

const styles = theme => ({
    rootBlurred: {
        backgroundColor: theme.palette.primary[400],
        '&:hover': {
            backgroundColor: theme.palette.primary[300]
        }
    },
    rootFocused: {
        backgroundColor: theme.palette.primary[400],
        '&:hover': {
            backgroundColor: theme.palette.primary[300]
        }
    },
    inputInput: {
        color: theme.palette.getContrastText(theme.palette.primary[300])
    },
});

export default class SearchBox extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value || "",
            focused: false
        };

        this.searchInputProps = {
            id: 'search'
        };
    }

    /**
     * @param {React.ChangeEvent<HTMLTextAreaElement|HTMLInputElement>} evt
     */
    handleInput = evt => {
        if (evt.target) {
            this.setState({ value: evt.target.value });
            if (this.props.onChange)
                this.props.onChange(evt.target.value);
        }
    }

    /**
     * @param {React.KeyboardEvent<HTMLTextAreaElement|HTMLInputElement>} evt
     */
    handleKeyUp = evt => {
        switch (evt.key) {
            case 'Enter':  this.handleSearch(); break;
            case 'Escape': this.handleCancel(); break;
        }
    }

    handleSearch = () => {
        if (this.props.onRequestSearch) {
            this.props.onRequestSearch(this.state.value);
        }
    }

    handleCancel = () => {
        this.setState({ value: '' });
        if (this.props.onChange) {
            this.props.onChange('');
        }
    }

    handleFocus = () => { this.setState({ focused: true  }); }
    handleBlur =  () => { this.setState({ focused: false }); }

    /**
     * @param {KeyboardEvent} evt
     */
    handleKeyDown = evt => {
        switch (evt.key) {

            // Ctrl+F => Focus search box and select its text
            case 'f':
                if (evt.ctrlKey) {
                    const elt = /** @type {HTMLInputElement} */
                                (document.getElementById('search'));
                    elt.focus();
                    elt.select();
                }
                break;

        }
    }

    componentDidMount()    { window.addEventListener(   'keydown', this.handleKeyDown); }
    componentWillUnmount() { window.removeEventListener('keydown', this.handleKeyDown); }

    render() {
        const { value, focused } = this.state;
        const { disabled } = this.props;

        return (
            <Paper elevation={0}
                css={css(focused ? {height:          35,
                                    width:           focusedWidth,
                                    display:         'flex',
                                    justifyContent:  'space-between',
                                    WebkitAppRegion: 'no-drag',
                                    transition:      'width 0.2s',
                                    /*
                                    backgroundColor: theme.palette.primary[400],
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary[300]
                                    }
                                    */
                                   }
                                 : {height:          35,
                                    width:           blurredWidth,
                                    display:         'flex',
                                    justifyContent:  'space-between',
                                    WebkitAppRegion: 'no-drag',
                                    transition:      'width 0.2s',
                                    /*
                                    backgroundColor: theme.palette.primary[400],
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary[300]
                                    }
                                    */
                                   })}>
                <div css={css(focused ? {margin:     'auto 16px',
                                         width:      focusedWidth,
                                         transition: 'width 0.2s'}
                                      : {margin:     'auto 16px',
                                         width:      blurredWidth,
                                         transition: 'width 0.2s'})}>
                    <Input css={css(focused ? {width:      focusedWidth - 16,
                                               transition: 'width 0.2s'}
                                            : {width:      blurredWidth - 16,
                                               transition: 'width 0.2s'})}
                        classes={{
                            input: cssName({
                                /*
                                color: theme.palette.getContrastText(theme.palette.primary[300])
                                */
                            })
                        }}
                        startAdornment={
                            <InputAdornment position="start">
                                <IconButton onClick={this.handleSearch} disabled={disabled || value === ''}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={this.handleCancel} disabled={disabled || value === ''}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                        placeholder="filter..."
                        margin="dense"
                        inputProps={this.searchInputProps}
                        value={value}
                        disableUnderline={true}
                        disabled={disabled}
                        onChange={this.handleInput}
                        onKeyUp={this.handleKeyUp}
                        onFocus={this.handleFocus}
                        onBlur={this.handleBlur}
                        />
                </div>
            </Paper>
        );
    }
}
