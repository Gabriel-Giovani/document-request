import React, { forwardRef } from "react";
import { Input } from 'antd';
import ReactInputMask from 'react-input-mask';
import PropTypes from 'prop-types';

const CustomInput = forwardRef((props: any, ref: any) => {
    return (
        <ReactInputMask {...props}>
            {(inputProps: any) => (
                <Input
                    {...inputProps}
                    ref={ref}
                    disabled={props.disabled ? props.disabled : null}
                />
            )}
        </ReactInputMask>
    );
});

CustomInput.propTypes = {
    mask: PropTypes.string,
    maskChar: PropTypes.string,
    formatChars: PropTypes.object,
    alwaysShowMask: PropTypes.bool,
    inputRef: PropTypes.func
};

export default CustomInput;