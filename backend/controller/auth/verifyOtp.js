// ** JWT import
const jwt = require('jsonwebtoken')
const httpErrors = require('http-errors')
const { getJwtConfig } = require('../../configs/auth')
const { User } = require('../../models')
const { loginValidation } = require('../../joiSchemas')

// ** initialize configurations
const jwtConfig = getJwtConfig()

// Helper to create access token
const createAccessToken = userId => {
  return jwt.sign({ id: userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expirationTime
  })
}

// Main login function
module.exports = async (req, res, next) => {
  try {
    let { email, username, otp } = req.body

    const { error } = loginValidation.validate(req.body)
    if (error) return next(httpErrors(400, error.message))

    // converting to lowercase
    username = username?.toLowerCase()

    let user = await User.findOne({
      otp,
      $or: [{ email }, { username }]
    })

    if (!user) return next(httpErrors(404, 'Invalid OTP'))

    await User.findByIdAndUpdate(user._id, { otp: null })

    const accessToken = createAccessToken(user.id)

    const payload = {
      accessToken,
      userData: { ...user.toObject(), password: undefined, verificationToken: undefined, otp: undefined }
    }
    return res.status(200).json(payload)
  } catch (err) {
    console.log(err)
    next(httpErrors(500, err.message))
  }
}
