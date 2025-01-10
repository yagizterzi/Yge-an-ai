const httpErrors = require('http-errors')
const bcrypt = require('bcrypt')

const { User } = require('../../models')
const { loginValidation } = require('../../joiSchemas')
const sendEmail = require('../../utils/sendEmail')
const generateSecureOTP = require('../../utils/generateOtp')

// Helper to handle user registration and send verification email
const registerUserAndSendEmail = async (email, username, provider) => {
  let password = `qwe${email}poi`

  const newUser = await User.create({
    registeredWith: provider,
    email,
    username,
    password,
    isRegisterationVerified: true
  })

  const message = `
    <div style="text-align: center; font-family: sans-serif; background-color: #fcfcfc; color: rgb(0, 0, 0); padding: 2rem;">
      <h2>Find your Password for manual login below</2>
      <p>${password}</p>
    </div>
  `
  await sendEmail({
    email,
    subject: 'ygeian - Custom password',
    html: message
  })

  return newUser
}

// Main login function
module.exports = async (req, res, next) => {
  try {
    let { email, username, password, provider, image } = req.body

    const { error } = loginValidation.validate(req.body)
    if (error) return next(httpErrors(400, error.message))

    // converting to lowercase
    username = username?.toLowerCase()

    let user = await User.findOne({ $or: [{ email }, { username }] })

    if (!user && provider === 'google') {
      user = await registerUserAndSendEmail(email, username, provider)
    }
    if (!user && provider === 'linkedIn') {
      user = await registerUserAndSendEmail(email, username, provider)
    }

    if (!user) return next(httpErrors(400, 'Invalid Email/username or Password'))

    if (provider !== 'google' && provider !== 'linkedIn') {
      if (!password) return next(httpErrors(400, 'Please Provide password'))
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) return next(httpErrors(400, 'Invalid Email/username or Password'))
    }

    if (!user.image && image) {
      await User.findByIdAndUpdate(user._id, { image })
    }

    const otp = generateSecureOTP()

    await User.findByIdAndUpdate(user._id, { otp })

    const message = `
      <div style="text-align: center; font-family: sans-serif; background-color: #fcfcfc; color: rgb(0, 0, 0); padding: 2rem;">
        <h2>OTP</h2>
        <h4>Please Enter OTP below to Login</h4>
        <p>${otp}</p>
      </div>
    `
    await sendEmail({
      email,
      subject: 'ygeian - OTP',
      html: message
    })

    return res.status(200).json({ message: `Enter OTP to Login` })
  } catch (err) {
    console.log(err)
    next(httpErrors(500, err.message))
  }
}
