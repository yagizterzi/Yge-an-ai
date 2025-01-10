// ** Package Imports
const httpErrors = require('http-errors')
const { User } = require('../../models')

module.exports = async (req, res, next) => {
  let token = req.params.token

  try {
    // find token in DB
    const checkIfTokenExist = await User.findOne({ verificationToken: token })
    if (!checkIfTokenExist) return next(httpErrors(404, 'Invalid Token/Token Expired'))

    let toUpdate = {
      verificationToken: null,
      isRegisterationVerified: true
    }
    // verify-token
    await User.findByIdAndUpdate(checkIfTokenExist._id, toUpdate)

    return res.status(200).json({ message: 'Token Verified' })
  } catch (err) {
    next(httpErrors(500, err.message))
  }
}
