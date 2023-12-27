

import mongoose  from 'mongoose';
const { Schema } = mongoose;

const cartSchema= new mongoose.Schema({
  product: {
    type: Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Please provide the product information!'],
  },
  quantity: {
    type: Number,
    default:1
  },
  price: {
    type: Number,
    required: true,
    min: [1, 'Total price cannot be negative'],
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please provide the user information!'],
  },
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
