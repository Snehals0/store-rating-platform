const { body, validationResult } = require('express-validator');

// Reusable handler to evaluate validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors cleanly
    const extractedErrors = errors.array().map(err => err.msg);
    return res.status(400).json({ error: extractedErrors.join(', ') });
  }
  next();
};

const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format.')
    .normalizeEmail(),
  body('password')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/)
    .withMessage('Password must be 8-16 characters long and contain at least one uppercase letter and one special character.'),
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must be a maximum of 400 characters.'),
  validateRequest
];

const validatePasswordUpdate = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required.'),
  body('newPassword')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/)
    .withMessage('New password must be 8-16 characters long and contain at least one uppercase letter and one special character.'),
  validateRequest
];

module.exports = {
  validateRegistration,
  validatePasswordUpdate
};
