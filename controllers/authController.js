import crypto from 'crypto'
import { promisify } from 'util'
import usermodel from '../models/userModel.js'
import catchAsync from './../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import jsonwebtoken from 'jsonwebtoken'
import Email from './../utils/email.js'

const signToken = userId =>{
    return jsonwebtoken.sign({id:userId},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};








export const singnUp=catchAsync(async (req,res,next)=>{
    const newuser = await usermodel.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        photo:req.body.photo
    });
    const url = `${req.protocol}://${req.get('host')}/`;
  console.log(url)
  await new Email(newuser,url).sendWelcome()
    createAndSendToken(newuser._id,201,res)
    
    // const token = signToken(newuser._id)

    // res.status(201).json({
    //   status: 'success',
    //   token,
    //   data: {
        
    //     user: newuser,
    //   },
    // });
})

export const login =catchAsync(async  (req,res,next) =>{
    const {email,password} = req.body

    //checking is there password and email
    if(!email || !password){
        return next(new AppError("there is no password or email",404))
    }

    //finding password and email valid which icludes the function in model compares with the encypted password in dbs
    const user = await usermodel.findOne({email}).select("+password")
    
    if(!user || !await user.correctPassword(password,user.password)){
        next(new AppError('invalid email or password!',404))
    }

    //send token
    createAndSendToken(user._id,200,res)
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status:'success',
    //     token

    // })
})


export const protect = catchAsync(async (req,res,next)=>{
    //check if there token and its valid
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token= req.headers.authorization.split(' ')[1]
    }
    console.log(req.headers.authorization)
    if(!token){
        return next(new AppError('you are not logged in! please loggin',401))
    }
    
  
    //verify loggedin token
    const decoded = await promisify(jsonwebtoken.verify)(token,process.env.JWT_SECRET)
    // console.log(decoded)

    //check if user still existed in dbs .
    const currentuser = await usermodel.findById(decoded.id)
    if(!currentuser){
        return next(new AppError('the user belongs to this token is no longer existed',401))
    }

    //verify password does not change after  that . using instance method on model
    if(currentuser.changedPasswordAfter(decoded.iat)) {
        return next(
          new AppError('User recently changed password! Please log in again.', 401)
        );
      }

    req.user = currentuser;

      //permission granted
    next()

})


export function restrictTo(...roles) {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
  }

export const forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await usermodel.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError("There is no user with email address.", 404));
    }
  
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
  
    // 3) Send it to user's email
   
    try {
      // await sendEmail({
      //   email: user.email,
      //   subject: "Your password reset token (valid for 10 min)",
      //   message,
      // });

      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;
    
  
      await new Email(user,resetURL).sendPasswordReset()
  
      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  });

export const resetPasswod = catchAsync(async(req,res,next)=>{
    const hashedToken = crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await usermodel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //
  createAndSendToken(user,200,res)
  // const token = signToken(user._id)
  //   res.status(200).json({
  //       status:'success',
  //       token

  //   })
  })


export const updatePassword = catchAsync(async(req,res,next)=>{
    // find if there any user
    const user = await usermodel.findById(req.user.id).select('+password')
    if(!user){
      next(new AppError('found no user',401))
    }
    //check if current password correct using model instance method
    if(!(await user.correctPassword(req.body.currentPassword,user.password))){
      next(new AppError('current password is wrong',401))
    }

    //update password
    user.password=req.body.password,
    user.confirmPassword=req.body.confirmPassword
    await user.save()


    //login send jwt
    createAndSendToken(user,200,res)
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status:'success',
    //     token

    // })

  })