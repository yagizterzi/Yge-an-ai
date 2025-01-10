const authRoutes = require('express').Router()
const { authMe, logIn, register, tokenVerification, verifyOTP, resendOTP } = require('../controller/auth')

authRoutes
  .get('/check-session', authMe)
  .post('/login', logIn)
  .post('/register', register)
  .get('/verify-token/:token', tokenVerification)
  .post('/resend-otp', resendOTP)
  .post('/verify-otp', verifyOTP)

module.exports = authRoutes
