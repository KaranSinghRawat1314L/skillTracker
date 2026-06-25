const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    line1:      { type: String, default: '' },
    line2:      { type: String, default: '' },
    city:       { type: String, default: '' },
    state:      { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country:    { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },          // never returned by default
    authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
    googleId:     { type: String, default: '' },
    // profilePicId points to a file stored in GridFS (profilePics bucket)
    profilePicId: { type: mongoose.Schema.Types.ObjectId, default: null },
    role:         { type: String, enum: ['user', 'admin'], default: 'user' },
    mobile:       { type: String, default: '' },
    address:      { type: addressSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Strip sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
