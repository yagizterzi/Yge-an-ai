const joi = require('joi')

module.exports = joi.object({
  fullName: joi.string().required(),
  username: joi.string().required()
})
