import productmodel from "./../models/productModel.js";
import APIFeatures from './../utils/apifeatures.js';
import AppError from './../utils/appError.js';
import catchAsync from './../utils/catchAsync.js';
import multer from "multer";
import sharp from "sharp";

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


export const uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "image", maxCount: 3 },
]);
export const resizeProductImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.image) return next();

  //ifor image cover
  req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.imageCover}`);


    req.body.image = [];
    await Promise.all(
      req.files.image.map(async (file, i) => {
        const fileName = `product-${req.params.id}-${Date.now()}-${i}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${fileName}`);
        req.body.image.push(fileName);
      })
    );
console.log()
  next();
});




export const addProduct = catchAsync(async (req, res, next) => {
  // Assuming your authentication middleware adds the user to the request object
  const sellerId = req.user._id;

  // Add the seller field to the request body
  req.body.seller = sellerId;

  const newProduct = await productmodel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newProduct,
    },
  });
});


export const getAllProducts = catchAsync(async (req, res,next) => {
    
        const features = new APIFeatures (productmodel.find(),req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      
      const products = await features.query;
      res.status(200).json({
        status: 'success',
        length:products.length,
        data: {
          products
        }
      });
    
  });


export const getProduct = catchAsync(async(req,res,next)=>{
    const product = await productmodel.findById(req.params.id)
    .populate('seller', 'name') 
    .populate('category', 'name'); 

        if(!product){
          console.log('no product')
        }
        res.status(200).json({
            status: 'success',
            data: {
              product
            }
          });
          
   
  })


export const updateProduct = catchAsync(async(req,res,next)=>{
    
        const product = await productmodel.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        if(!product){
        
          return next(new AppError(`cannot find product by this id !`,404))
        }
        res.status(200).json({
            status: 'success',
            data: {
              product
            }
          });
    
  })



export const removeProduct =catchAsync( async (req,res,next)=>{
        const product = await productmodel.findByIdAndDelete(req.params.id)
        if(!product){
          return next(new AppError("no product found by this id!",404))
        }
        res.status(204).json({
            status: 'success',
            data: null
          });
    
  })

  