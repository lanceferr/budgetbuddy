import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({

    username : {

        type: String, 
        required:true,
        unique: true,
        trim: true,

    },

    email : {

        type: String, 
        required:true,
        unique: true,
        lowercase: true,
        trim: true,

    },

    authentication : {

        password: {

            type: String, 
            required:true, 
            select: false

        },

        salt: {

            type: String,
            required: true,
            select: false

        },

        sessionToken: {

            type: String,
            index: true,
            select: false

        },

        sessionExpiry: {

            type: Date,
            select: false

        },

        resetPasswordToken: {

            type: String,
            select: false

        },

        resetPasswordExpiry: {

            type: Date,
            select: false

        },

    },

}, { timestamps: true });

export const UserModel = mongoose.model('User',UserSchema);

export const getUsers = () => UserModel.find().lean();
export const getUserByEmail = (email : string) => UserModel.findOne({email}).lean();
export const getUserByEmailWithAuth = (email: string) =>
  UserModel.findOne({ email }).select('+authentication.password +authentication.salt');

export const getUserBySessionToken = (sessionToken : string) => UserModel.findOne({
    'authentication.sessionToken' : sessionToken,
}).select('+authentication.sessionExpiry');

export const getUserById = (id : string) => UserModel.findById(id).lean();
export const createUser = (values: Record<string, any>) => new UserModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id : string) => UserModel.findOneAndDelete({_id : id}).lean();
export const updateUserById = (id : string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values, { new: true, runValidators: true }).lean();

export const getUserByResetToken = (resetToken: string) => 
  UserModel.findOne({ 
    'authentication.resetPasswordToken': resetToken,
    'authentication.resetPasswordExpiry': { $gt: Date.now() } // Token must not be expired
  }).select('+authentication.resetPasswordToken +authentication.resetPasswordExpiry');

export const setResetToken = async (email: string, token: string, expiry: Date) => {
  return UserModel.findOneAndUpdate(
    { email },
    { 
      'authentication.resetPasswordToken': token,
      'authentication.resetPasswordExpiry': expiry
    },
    { new: true }
  );
};

export const clearResetToken = async (userId: string) => {
  return UserModel.findByIdAndUpdate(
    userId,
    { 
      $unset: { 
        'authentication.resetPasswordToken': '',
        'authentication.resetPasswordExpiry': ''
      }
    },
    { new: true }
  );
};