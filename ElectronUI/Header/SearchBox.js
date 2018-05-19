// Inspired by https://github.com/TeamWertarbyte/material-ui-search-bar
// Borrowing selectively because I don't trust Node dependencies.
// I hope that's allowed by the MIT license.
// Modified to mimic the search box on https://material-ui.com/api/

import React, { PureComponent } from 'react';
import autobind                 from 'class-autobind';

import withStyles           from '@material-ui/core/styles/withStyles';

import IconButton           from '@material-ui/core/IconButton';
import Tooltip              from '@material-ui/core/Tooltip';
import Input                from '@material-ui/core/Input';
import InputAdornment       from '@material-ui/core/InputAdornment';
import Paper                from '@material-ui/core/Paper';

import SearchIcon           from '@material-ui/icons/Search';
import ClearIcon            from '@material-ui/icons/Clear';

const blurredWidth = 200;
const focusedWidth = 250;

const styles = theme => ({
    rootBlurred: {
        height: 35,
        width: blurredWidth,
        display: 'flex',
        justifyContent: 'space-between',
        "-webkit-app-region": "no-drag",
        transition: 'width 0.2s',
        backgroundColor: theme.palette.primary[400],
        '&:hover': {
            backgroundColor: theme.palette.primary[300]
        }
    },
    rootFocused: {
        height: 35,
        width: focusedWidth,
        display: 'flex',
        justifyContent: 'space-between',
        "-webkit-app-region": "no-drag",
        backgroundColor: theme.palette.primary[400],
        transition: 'width 0.2s',
        '&:hover': {
            backgroundColor: theme.palette.primary[300]
        }
    },
    searchContainerBlurred: {
        margin: 'auto 16px',
        width: blurredWidth,
        transition: 'width 0.2s'
    },
    searchContainerFocused: {
        margin: 'auto 16px',
        width: focusedWidth,
        transition: 'width 0.2s'
    },
    inputBlurred: {
        width: blurredWidth - 16,
        transition: 'width 0.2s'
    },
    inputFocused: {
        width: focusedWidth - 16,
        transition: 'width 0.2s'
    },
    inputInput: {
        color: theme.palette.getContrastText(theme.palette.primary[300])
    },
});

class SearchBox extends PureComponent {
    constructor(props) {
        super(props);
        autobind(this);
        this.state = {
            value: this.props.value || "",
            focused: false
        };

        this.searchInputProps = {
            id: 'search'
        };
        this.inputClass = {
            input: this.props.classes.inputInput
        };
    }

    handleInput(ev) {
        this.setState({ value: ev.target.value });
        if (this.props.onChange) {
            this.props.onChange(ev.target.value);
        }
    }

    handleKeyUp(ev) {
        switch (ev.key) {
            case 'Enter':  this.handleSearch(); break;
            case 'Escape': this.handleCancel(); break;
        }
    }

    handleSearch() {
        if (this.props.onRequestSearch) {
            this.props.onRequestSearch(this.state.value);
        }
    }

    handleCancel() {
        this.setState({ value: '' });
        if (this.props.onChange) {
            this.props.onChange('');
        }
    }

    handleFocus() { this.setState({ focused: true  }); }
    handleBlur()  { this.setState({ focused: false }); }

    handleKeyDown(ev) {
        switch (ev.key) {

            // Ctrl+F => Focus search box and select its text
            case 'f':
                if (ev.ctrlKey) {
                    const elt = document.getElementById('search')
                    elt.focus();
                    elt.select();
                }
                break;

        }
    }

    componentWillMount()   { window.addEventListener(   'keydown', this.handleKeyDown); }
    componentWillUnmount() { window.removeEventListener('keydown', this.handleKeyDown); }

    render() {
        const { value,   focused  } = this.state;
        const { classes, disabled } = this.props;

        return (
            <Paper elevation={0} className={focused ? classes.rootFocused : classes.rootBlurred}>
                <div className={focused ? classes.searchContainerFocused : classes.searchContainerBlurred}>
                    <Input className={focused ? classes.inputFocused : classes.inputBlurred}
                        classes={this.inputClass}
                        startAdornment={
                            <InputAdornment>
                                <IconButton onClick={this.handleSearch} disabled={disabled || value === ''}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                        endAdornment={
                            <InputAdornment>
                                <IconButton onClick={this.handleCancel} disabled={disabled || value === ''}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        }
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

export default withStyles(styles)(SearchBox);
