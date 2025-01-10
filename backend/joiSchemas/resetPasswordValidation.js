const joi = require('joi')

module.exports = joi.object({
  resetPasswordToken: joi.string().required(),
  password: joi.string().required(),
  confirmPassword: joi.string().required()
})
