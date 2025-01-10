const mongoose = require('mongoose')
const bcrypt = require('bcrypt') // Use bcrypt for hashing passwords
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    registeredWith: { type: String, default: 'manual' },
    otp: { type: Number },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    isRegisterationVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
)

// Pre-save middleware for password encryption
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(user.password, salt)
    } catch (err) {
      return next(err)
    }
  }
  next()
})

const User = mongoose.model('users', userSchema)

module.exports = User
