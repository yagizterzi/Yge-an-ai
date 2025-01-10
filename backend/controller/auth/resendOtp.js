const httpErrors = require('http-errors')

const { User } = require('../../models')

const sendEmail = require('../../utils/sendEmail')
const generateSecureOTP = require('../../utils/generateOtp')

// Main login function
module.exports = async (req, res, next) => {
  try {
    let { email } = req.body

    let user = await User.findOne({ email })

    if (!user) return next(httpErrors(400, 'unable to sent OTP'))

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

    return res.status(200).json({ message: `OTP resent Successfully` })
  } catch (err) {
    console.log(err)
    next(httpErrors(500, err.message))
  }
}
