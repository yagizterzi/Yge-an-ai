const httpErrors = require('http-errors')
const { User } = require('../../models')
const { resetPasswordValidation } = require('../../joiSchemas')
const sendEmail = require('../../utils/sendEmail')
const bcrypt = require('bcrypt')

// Main login function
module.exports = async (req, res, next) => {
  try {
    let payload = req.body

    //validation
    const { error } = resetPasswordValidation.validate(payload)
    if (error) return next(httpErrors(400, error.message))

    let { password, confirmPassword, resetPasswordToken } = payload

    //comparing password and confirm password
    if (password !== confirmPassword) return next(httpErrors(400, `Password and Confirm Password Must Match`))

    let user = await User.findOne({ resetPasswordToken })

    if (!user) return next(httpErrors(400, 'Invalid Token/Token expired'))

    //hashing password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await User.findByIdAndUpdate(user._id, { password: hashedPassword, resetPasswordToken: null })

    const message = `
      <div style="text-align: center; font-family: sans-serif; background-color: #fcfcfc; color: rgb(0, 0, 0); padding: 2rem;">
      
        <p>
        You have successfully changed your ygeian password
        </p>
       
      </div>
    `

    let email = user.email
    await sendEmail({
      email,
      subject: 'ygeian - Password Changed',
      html: message
    })

    return res.status(200).json({ message: `you have successfully updated your password` })
  } catch (err) {
    console.log(err)
    next(httpErrors(500, err.message))
  }
}
