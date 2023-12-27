import categorymodel from './../models/categoryModel.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import productmodel from './../models/productModel.js';

export const categories = catchAsync(async (req, res,next) => {
  
      const categories = await categorymodel.find();
      
  
      res.status(200).json({
        status: 'success',
        length:categories.length,
        data: {
          categories
        }
      });
   
  });


export const createCategory =catchAsync(async (req, res, next) => {
    const newcat = await categorymodel.create(req.body);
  
    res.status(201).json({
      status: 'success',
      data: {
        
        user:newcat
      }
    });
  });


export const removeCategory = catchAsync(async (req, res) => {
      const category = await categorymodel.findByIdAndDelete(req.params.id);
      
      if(!category){
        return next(new AppError("no category found by this id!",404))
      }
      res.status(204).json({
        status: 'success',
        
        data: null
      });
    
  });


export const getProductsByCategory = catchAsync(async (req, res, next) => {
    const categoryId = req.params.cid;
  
    // Check if the category exists
    const category = await categorymodel.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found!', 404));
    }
  
    // Find all products that belong to the specified category
    const products = await categorymodel.find({ category: categoryId });
  
    res.status(200).json({
      status: 'success',
      products:products.length,
      data: {
        products,
      },
    });
  });