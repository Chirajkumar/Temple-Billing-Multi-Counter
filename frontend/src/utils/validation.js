/**
 * Form validation utilities
 */

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Password validation (min 6 characters)
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Required field validation
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

// Number validation
export const isValidNumber = (value) => {
  return !isNaN(value) && value !== '' && value !== null;
};

// Positive number validation
export const isPositiveNumber = (value) => {
  return isValidNumber(value) && parseFloat(value) > 0;
};

// Date validation
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Future date validation
export const isFutureDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) >= today;
};

// Past date validation
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(date) <= today;
};

/**
 * Validate form fields
 * @param {Object} values - Form values
 * @param {Object} rules - Validation rules
 * @returns {Object} - Errors object
 */
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    // Required validation
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.requiredMessage || `${field} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!isRequired(value)) return;

    // Email validation
    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = fieldRules.emailMessage || 'Invalid email address';
      return;
    }

    // Phone validation
    if (fieldRules.phone && !isValidPhone(value)) {
      errors[field] = fieldRules.phoneMessage || 'Invalid phone number';
      return;
    }

    // Password validation
    if (fieldRules.password && !isValidPassword(value)) {
      errors[field] = fieldRules.passwordMessage || 'Password must be at least 6 characters';
      return;
    }

    // Number validation
    if (fieldRules.number && !isValidNumber(value)) {
      errors[field] = fieldRules.numberMessage || 'Must be a valid number';
      return;
    }

    // Positive number validation
    if (fieldRules.positive && !isPositiveNumber(value)) {
      errors[field] = fieldRules.positiveMessage || 'Must be a positive number';
      return;
    }

    // Min length validation
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = fieldRules.minLengthMessage || `Must be at least ${fieldRules.minLength} characters`;
      return;
    }

    // Max length validation
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = fieldRules.maxLengthMessage || `Must be at most ${fieldRules.maxLength} characters`;
      return;
    }

    // Min value validation
    if (fieldRules.min !== undefined && parseFloat(value) < fieldRules.min) {
      errors[field] = fieldRules.minMessage || `Must be at least ${fieldRules.min}`;
      return;
    }

    // Max value validation
    if (fieldRules.max !== undefined && parseFloat(value) > fieldRules.max) {
      errors[field] = fieldRules.maxMessage || `Must be at most ${fieldRules.max}`;
      return;
    }

    // Custom validation
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, values);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
};

/**
 * Hook for form validation
 */
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate single field on blur
    const fieldErrors = validateForm({ [name]: values[name] }, { [name]: validationRules[name] });
    if (fieldErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const validate = () => {
    const newErrors = validateForm(values, validationRules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues,
  };
};

export default {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isRequired,
  isValidNumber,
  isPositiveNumber,
  isValidDate,
  isFutureDate,
  isPastDate,
  validateForm,
  useFormValidation,
};
