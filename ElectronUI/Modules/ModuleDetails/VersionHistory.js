import React, { PureComponent } from 'react';

import withStyles           from '@material-ui/core/styles/withStyles';

import Table                from '@material-ui/core/Table';
import TableBody            from '@material-ui/core/TableBody';
import TableRow             from '@material-ui/core/TableRow';
import TableHead            from '@material-ui/core/TableHead';
import TableCell            from '@material-ui/core/TableCell';

const styles = {
    row: {
        height: 24
    }
};

class VersionHistory extends PureComponent {
    constructor(props) {
        super(props);

    }

    render() {
        const { versions, classes } = this.props;

        return (
            <Table>
                <TableHead>
                    <TableCell>Module Version</TableCell>
                    <TableCell>Compatible Game Versions</TableCell>
                </TableHead>
                <TableBody>
                    {
                        versions ? versions.map(ver =>
                            <TableRow className={classes.row}>
                                <TableCell>{ver.Version}</TableCell>
                                <TableCell>{ver.GameVersionRange}</TableCell>
                            </TableRow>
                        ) : null
                    }
                </TableBody>
            </Table>
        );
    }
}

export default withStyles(styles)(VersionHistory);
