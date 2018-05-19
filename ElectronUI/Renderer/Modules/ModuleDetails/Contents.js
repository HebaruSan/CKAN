/** @jsx jsx */
import { PureComponent } from 'react';
import { jsx, css }      from '@emotion/react';

import List              from '@mui/material/List';
import ListItem          from '@mui/material/ListItem';
import ListItemText      from '@mui/material/ListItemText';
import Typography        from '@mui/material/Typography';
import Button            from '@mui/material/Button';

import FileDownload      from '@mui/icons-material/FileDownload';

import Loading           from '../../Components/Loading.js';

export default class Contents extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
    }

    handleDownload = () => {
        // TODO
        alert("DOWNLOAD");
    }

    render() {
        const { contents } = this.props;
        return contents
            ? (contents.length > 0
                ? (<List dense={true}
                         disablePadding={true}>
                    { contents.map(file => (
                        <ListItem dense={true}
                                  key={file}
                                  sx={{py: 0.25}}>
                            <ListItemText primary={file}
                                          primaryTypographyProps={{variant:    'caption',
                                                                   noWrap:     true,
                                                                   fontFamily: 'monospace'}}
                                          sx={{my: 0}} />
                        </ListItem>
                    )) }
                   </List>)
                : (<Button variant="contained"
                           color="secondary"
                           fullWidth={true}
                           size="large"
                           startIcon={<FileDownload/>}
                           onClick={this.handleDownload}>
                        Download
                   </Button>))
            : (<Loading diameter={128}
                        text="Unzipping..." />);
    }
}
