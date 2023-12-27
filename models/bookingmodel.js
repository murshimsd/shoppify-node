import mongoose from 'mongoose';
const { Schema } = mongoose;

const bookingSchema = new Schema({
    products: [
      {
        product: {
          type: Schema.ObjectId,
          ref: 'Product',
          required: [true, 'Please provide the product information!'],
        },
        quantity: {
          type: Number,
          required: [true, 'Please provide the booking quantity!'],
          min: [1, 'Quantity cannot be negative'],
        },
        productDetails: {
          productName: String,
          productImage: String,
          productPrice: Number,
          seller: {
            type: Schema.ObjectId,
            ref: 'User', // Assuming User model for seller
            required: [true, 'Please provide the seller information!'],
          },
        },
      },
    ],
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user information!'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please provide the total booking amount!'],
      min: [1, 'Total amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cod'],
      required: [true, 'Please provide the payment method!'],
    },
   
    createdAt: {
      type: Date,
      default: Date.now,
    },
    trackingNumber: {
      type: String,
      required: [true, 'Please provide the tracking number!'],
      unique: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9]+$/.test(value);
        },
        message: 'Tracking number must be alphanumeric',
      },
    },
  });
const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

