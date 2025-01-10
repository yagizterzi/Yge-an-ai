// ** Package Imports
const httpErrors = require('http-errors')
const { User } = require('../../models')
const { isValidEmail } = require('../../joiSchemas')
const { v4: uuidv4 } = require('uuid')
const sendEmail = require('../../utils/sendEmail')
module.exports = async (req, res, next) => {
  let { email } = req.body

  try {
    //payload validation
    const { error } = isValidEmail.validate({ email: email })
    if (error) return next(httpErrors(400, error.message))

    // check if user exists
    const user = await User.findOne({ email })
    if (!user) return next(httpErrors(404, 'If your email is registered, you will get reset password link Shortly'))

    //create a token
    const resetPasswordToken = uuidv4()

    //update token
    await User.findByIdAndUpdate(user._id, { resetPasswordToken })

    //send mail
    let url = process.env.FRONT_END_URL
    let resetURL = `${url}/reset-password/${resetPasswordToken}`

    // custom message
    let message = `
    <div
    style="
      text-align: center;
      font-family: sans-serif;
      background-color: #fcfcfc;
      color: rgb(0, 0, 0);
      padding: 2rem;
    "
  >
    <p>Click the Reset Password Button to reset your password</p>
    <button
      style="
        background-color: #d8ba70;
        padding: 10px 15px;
        font-weight: 700;
        color: rgb(0, 0, 0);
        border: none;
        border-radius: 4px;
      "
    >
      <a
        href="${resetURL}"
        style="text-decoration: none; color: rgb(0, 0, 0)"
      >
        Reset Password 
      </a>
    </button>
  </div>
  `

    // sending mail
    await sendEmail({
      email: email,
      subject: 'ygeian - Reset Password',
      html: message
    })

    return res.status(200).json({ message: 'If your email is registered, you will get reset password link Shortly' })
  } catch (err) {
    next(httpErrors(500, err.message))
  }
}
