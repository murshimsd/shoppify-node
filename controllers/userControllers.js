import usermodel from "../models/userModel.js";
import catchAsync from "./../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import multer from "multer";
import sharp from "sharp";

// const multerStorage = multer.diskStorage({
//   destination:(req,file,cb)=>{
//     cb(null,'public/img/users')
//   },
//   filename:(req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1]
//     cb(null,`user-${req.user.id}-${Date.now()}-${ext}`)
//   }
// })
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image! please upload valid image", false));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});


export const updateUserPhoto = upload.single('photo')
export const resizeUserPhoto = catchAsync(async(req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const addUser = catchAsync(async (req, res, next) => {
  const newuser = await usermodel.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user: newuser,
    },
  });
});

export const getAllUser = catchAsync(async (req, res, next) => {
  const users = await usermodel.find();

  res.status(200).json({
    status: "success",
    length: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await usermodel.findById(req.params.id);
  if (!user) {
    return next(new AppError("no user found by this id!", 404));
    // return next(new AppError('Testing error handling', 500));
  }

  res.status(200).json({
    status: "success",

    data: {
      user,
    },
  });
});

export const removeUser = catchAsync(async (req, res, next) => {
  const user = await usermodel.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("no user found by this id!", 404));
  }

  res.status(204).json({
    status: "success",

    data: null,
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body)
  console.log(req.file)
  
  //show error if there is password field
  if (req.body.password || req.body.confirmPassword) {
    next(
      new AppError(
        "cannot update password ! password updation available on updateMyPassword",
        400
      )
    );
  }

  //updation
  const filterbody = filterObj(req.body, "name", "email");
  if (req.file) filterbody.photo = req.file.filename;
  const updateduser = await usermodel.findByIdAndUpdate(req.user.id, filterbody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateduser,
    },
  });
});


export const deleteMe = catchAsync(async(req,res,next)=>{
const user = await usermodel.findByIdAndUpdate(req.user.id,{active:false})

res.status(204).json({
  status:'success',
  data:null
})
})