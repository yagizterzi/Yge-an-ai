const joi = require('joi')

module.exports = joi.object({
  email: joi.string().email().required(),
  username: joi.string().required(),
  password: joi.string(),
  confirmPassword: joi.string()
})
