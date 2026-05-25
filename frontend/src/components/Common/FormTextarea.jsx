import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable form textarea component with validation
 */
const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  ...props
}) => {
  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(name);
    }
  };

  const showError = touched && error;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`form-control ${showError ? 'is-invalid' : ''}`}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? `${name}-error` : undefined}
        {...props}
      />
      {showError && (
        <div id={`${name}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
};

FormTextarea.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  touched: PropTypes.bool,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default FormTextarea;
