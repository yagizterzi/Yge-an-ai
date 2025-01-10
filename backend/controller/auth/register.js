// ** Package Imports
const httpErrors = require('http-errors')
const { User } = require('../../models')
const { authValidation } = require('../../joiSchemas')
const { v4: uuidv4 } = require('uuid')
const sendEmail = require('../../utils/sendEmail')
module.exports = async (req, res, next) => {
  let payload = req.body

  try {
    //payload validation
    const { error } = authValidation.validate(payload)
    if (error) return next(httpErrors(400, error.message))

    // checking for duplicate email
    const dupEmail = await User.findOne({ email: payload.email })
    if (dupEmail) return next(httpErrors(409, 'email already registerd'))
    // checking for duplicate username
    const dupUsername = await User.findOne({ username: payload.username })
    if (dupUsername) return next(httpErrors(409, 'username already taken'))

    // passwords match
    if (payload.password !== payload.confirmPassword)
      return next(httpErrors(400, `message: password and confirm password should match`))

    const verificationToken = uuidv4()

    payload = {
      ...payload,
      username: payload.username?.toLowerCase(),
      verificationToken
    }

    let url = process.env.FRONT_END_URL
    let verificationUrl = `${url}/verifyemail/${verificationToken}`

    // save info
    await User.create(payload)

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
    <p>Click On Verify button to Verify you Account</p>
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
        href="${verificationUrl}"
        style="text-decoration: none; color: rgb(0, 0, 0)"
      >
        Verify
      </a>
    </button>
  </div>
  `

    // sending mail
    await sendEmail({
      email: payload.email,
      subject: 'Verify your Account',
      html: message
    })

    return res.status(201).json({ message: 'Registration successful' })
  } catch (err) {
    next(httpErrors(500, err.message))
  }
}
