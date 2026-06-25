const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, select: false },

    // This is NOT the image itself — it's a pointer to a file
    // stored separately in the 'profilePics' GridFS bucket.
    profilePicId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
