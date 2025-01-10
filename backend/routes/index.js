const apis = require('express').Router()

apis.use('/jwt', require('./auth'))
apis.use('/gpt', require('./chatGpt'))
apis.use('/user', require('./user'))

module.exports = apis
