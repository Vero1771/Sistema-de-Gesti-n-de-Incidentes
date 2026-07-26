const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        errors,
        message: error.details[0].message
      });
    }
    next();
  };
};

module.exports = { validate };