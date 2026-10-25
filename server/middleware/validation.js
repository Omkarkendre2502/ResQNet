import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

export const registerValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
    .withMessage('Password must be at least 8 characters long and contain at least one letter and one number.'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(\+91[\-\s]?)?[0-9]{5}[\s\-]?[0-9]{5}$|^(\+91[\s-]?)?\(0\d{2,4}\)\s?\d{6,8}$|^[0-9]{10}$/)
    .withMessage('Phone number must be in a valid format (e.g. +91 98220 12345 or 10 digits).'),
  handleValidationErrors
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors
];

export const createIncidentValidator = [
  body('type')
    .isIn(['Fire', 'Flood', 'Accident', 'Building Collapse', 'Other'])
    .withMessage('Incident type must be one of: Fire, Flood, Accident, Building Collapse, Other.'),
  body('severity')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity must be one of: Low, Medium, High, Critical.'),
  body('location')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters.'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters.'),
  body('peopleAffected')
    .customSanitizer((val) => (val === undefined || val === null ? 1 : parseInt(val, 10)))
    .isInt({ min: 1, max: 10000 })
    .withMessage('People affected must be an integer between 1 and 10000.'),
  body('coordinates')
    .optional({ nullable: true })
    .custom((coords) => {
      if (typeof coords === 'string') {
        try {
          coords = JSON.parse(coords);
        } catch (e) {
          throw new Error('Coordinates must be an array of 2 numbers [latitude, longitude].');
        }
      }
      if (!Array.isArray(coords) || coords.length !== 2) {
        throw new Error('Coordinates must be an array of 2 numbers [latitude, longitude].');
      }
      const [lat, lng] = coords.map(Number);
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Coordinates must be numeric values.');
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Latitude must be between -90 and 90, and longitude between -180 and 180.');
      }
      return true;
    }),
  handleValidationErrors
];

export const assignIncidentValidator = [
  body('teamId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('teamId string is required.'),
  body('note')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Note must not exceed 300 characters.'),
  handleValidationErrors
];

export const statusIncidentValidator = [
  body('status')
    .isIn(['Reported', 'Assigned', 'On the Way', 'Reached', 'In Progress', 'Completed'])
    .withMessage('Status must be one of: Reported, Assigned, On the Way, Reached, In Progress, Completed.'),
  body('note')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Note must not exceed 300 characters.'),
  handleValidationErrors
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.'),
  handleValidationErrors
];

export const createRescueUserValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.'),
  body('teamId')
    .trim()
    .notEmpty()
    .withMessage('Rescue squad teamId is required (e.g. PERT-01).'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(\+91[\-\s]?)?[0-9]{5}[\s\-]?[0-9]{5}$|^(\+91[\s-]?)?\(0\d{2,4}\)\s?\d{6,8}$|^[0-9]{10}$/)
    .withMessage('Phone number must be in a valid format.'),
  handleValidationErrors
];

export const updateUserStatusValidator = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value (true or false).'),
  handleValidationErrors
];

