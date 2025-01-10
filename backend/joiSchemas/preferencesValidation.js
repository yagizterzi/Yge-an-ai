const joi = require('joi')

module.exports = joi.object({
  location: joi.string().allow(''),
  numOfPersons: joi.number().integer().min(1).default(1),
  budget: joi.number().min(0).default(1000),
  amenities: joi
    .array()
    .items(joi.string().valid('Wi-Fi', 'breakfast', 'air-condition', 'pool', 'gym', 'parking'))
    .default([]),
  roomType: joi.string().valid('single', 'double', 'shared', 'suite', 'family-room').default('single')
})
