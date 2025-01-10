const chatRoutes = require('express').Router()
const { prompt } = require('../controller/openAi')

chatRoutes.post('/gene-info', prompt)

module.exports = chatRoutes
