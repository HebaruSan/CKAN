/** @jsx jsx */
import { PureComponent, Fragment } from 'react';
import { jsx, css }                from '@emotion/react';

import Fade                        from '@mui/material/Fade';
import CircularProgress            from '@mui/material/CircularProgress';
import Typography                  from '@mui/material/Typography';
import Paper                       from '@mui/material/Paper';

export default class Loading extends PureComponent {
    /**
     * @param {object} props
     */
    constructor(props) {
        super(props);
    }

    render() {
        const { diameter, opaque, text } = this.props;

        const inner = (
            <Fragment>
                <Fade in={true}
                      css={css({transitionDelay: '0.8s',
                                position:        'absolute',
                                top:             '50%',
                                left:            '50%',
                                textAlign:       'center',
                                verticalAlign:   'middle',
                                alignItems:      'center',
                                justifyContent:  'center',
                                width:           diameter,
                                height:          diameter,
                                marginLeft:     -diameter / 2,
                                marginTop:      -diameter / 2,
                                borderRadius:    diameter / 2})}>
                    <CircularProgress color="primary"
                                      variant="indeterminate"
                                      size={diameter}
                                      thickness={5} />
                </Fade>
                <Typography color="secondary"
                            variant="h1"
                            css={css({position:  'absolute',
                                      top:       '50%',
                                      left:      '50%',
                                      transform: 'translate(-50%, -50%)'})}>
                    { text ? text : "Loading..." }
                </Typography>
            </Fragment>
        );

        return opaque ? (
            <Paper css={css({position:       'absolute',
                             top:            '50%',
                             left:           '50%',
                             textAlign:      'center',
                             verticalAlign:  'middle',
                             alignItems:     'center',
                             justifyContent: 'center',
                             width:          diameter,
                             height:         diameter,
                             marginLeft:    -diameter / 2,
                             marginTop:     -diameter / 2,
                             borderRadius:   diameter / 2})}>
                {inner}
            </Paper>
        ) : inner;
    }
}
