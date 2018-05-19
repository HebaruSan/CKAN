/** @jsx jsx */
import { PureComponent } from 'react';
import { jsx, css }      from '@emotion/react';

import Table             from '@mui/material/Table';
import TableBody         from '@mui/material/TableBody';
import TableRow          from '@mui/material/TableRow';
import TableHead         from '@mui/material/TableHead';
import TableCell         from '@mui/material/TableCell';

export default class VersionHistory extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
    }

    render() {
        const { versions } = this.props;

        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Version</TableCell>
                        <TableCell>Game Versions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        versions ? versions.map(ver =>
                            <TableRow key={ver.Version}>
                                <TableCell sx={{py: 1}}>{ver.Version}</TableCell>
                                <TableCell sx={{py: 1}}>{ver.GameVersionRange}</TableCell>
                            </TableRow>
                        ) : null
                    }
                </TableBody>
            </Table>
        );
    }
}
