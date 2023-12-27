import catchasync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import productmodel from './../models/productModel.js'


export const getOverview =catchasync(async (req,res,next) =>{
    const products = await productmodel.find()
    res.render('overview',{
        title:'All products',
        products:products
        
    })
})


export const getProduct= catchasync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const product = await productmodel.findOne({ slug: req.params.slug }).populate({
        path:'seller',
        fields:'name'
    }).populate({
        path:'category',
        fields:'name'
    })
    if (!product) {
      return next(new AppError('There is no product with that name.', 404));
    }
  
    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('product', {
      title: `${product.name} `,
      product
    });
  });


  export function   login(req, res, next) {
  
    res.status(200).render('login',{
      title:'login Into Your Account'
    })
  }



export const profile= catchasync(async (req, res, next) => {
  
    res.status(200).render('account')
  });


export const cart= catchasync(async (req, res, next) => {
  
    res.status(200).render('cart')
  });


