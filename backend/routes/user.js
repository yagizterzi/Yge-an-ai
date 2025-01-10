const { forgetPassword, resetPassword } = require('../controller/user')

const userRoutes = require('express').Router()

userRoutes.post('/forget-password', forgetPassword)
userRoutes.post('/update-password', resetPassword)

module.exports = userRoutes
