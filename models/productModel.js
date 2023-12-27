import mongoose from 'mongoose';
import slugify from 'slugify';
const {Schema} = mongoose
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the product name!'],
    maxlength: [30, 'Product name cannot exceed 30 characters'],
    unique: [true, 'This product name is already specified'],
  },
  description: {
    type: String,
    required: [true, 'Please provide the product description!'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide the product price!'],
    min: [1, 'Price cannot be zero'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide the product quantity!'],
    min: [1, 'Quantity cannot be negative'],
  },
  imageCover: {
    type: String,
    required: [true, "should specify cover Image"],
  },
  image: [String],
  seller: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide the seller information!'],
  },
  category: {
    type: Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide the category information!'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select:false
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    select:false
  },
  slug:String
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

productSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true})
    next()
})


productSchema.pre(/^find/, function(next) {
    // this.populate({
    //   path: 'seller',
    //   select: 'name photo'
    // });
    this.populate({
        path: 'category',
        select: 'name'
      });
    next();
  });

//   productSchema.virtual('addprice').get(function(){
//     return this.price * 2
//   })

const Product = mongoose.model('Product', productSchema);

export default Product;
