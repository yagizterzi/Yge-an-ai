const joi = require('joi')
module.exports = joi.object({
  username: joi.string(),
  email: joi.string().email(),
  password: joi.string().allow(''),
  image: joi.string().allow(''),
  provider: joi.string(),
  otp: joi.number()
})
