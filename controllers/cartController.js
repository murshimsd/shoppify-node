import cartmodel from './../models/cartModel.js'
import usermodel from './../models/userModel.js'
import bookingmodel from './../models/bookingmodel.js'
import APIFeatures from './../utils/apifeatures.js'
import AppError from './../utils/appError.js'
import catchAsync from './../utils/catchAsync.js'
import Product from './../models/productModel.js'
import crypto from 'crypto';





export const addCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.params.proid;

  // Fetch the product information including the price
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
  }

  // Check if the item already exists in the cart
  const existingCartItem = await cartmodel.findOne({ user: userId, product: productId });

  if (existingCartItem) {
    // If the item already exists in the cart, send a response and return from the function
    next(new AppError("Item already in cart !!!", 400))
    return res.status(400).json({
      status: 'error',
      message: 'Item already in cart!',
    });
  }

  // If the item is not in the cart, add it
  const cartItemData = {
    user: userId,
    product: productId,
    quantity: req.body.quantity || 1, // You may want to adjust this based on your requirements
    price: product.price, // Set the price from the product
  };

  const cartItem = await cartmodel.create(cartItemData);

  res.status(200).json({
    status: 'success',
    items: cartItem.length,
    data: {
      cartItem,
    },
  });
});


export const getCartItems = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Find cart items for the logged-in user
  const cartItems = await cartmodel.find({ user: userId }).populate({
    path: 'product',
    select: 'name price',
  });
  if (!cartItems || cartItems.length === 0) {
    return next(new AppError('Cart is empty', 404));
  }

  res.status(200).json({
    status: 'success',
    items:cartItems.length,
    data: {
      cartItems,
    },
  });
});

export const checkout = catchAsync(async (req, res, next) => {
  // Assuming you have a user object in req.user
  const user = req.user.id;

  if (!user) {
    return next(new AppError("Please log in", 401));
  }

  // Fetch the products in the user's cart
  const productCart = await cartmodel.find({ user: user }).populate('product');

  // Check if the cart is empty
  if (productCart.length === 0 ) {
    return next(new AppError("Cart is empty", 404));
  }

  let totalPrice = 0;

  // Calculate the total price and gather product details
  const productDetails = productCart.map((item) => {
    const productPrice = item.product.price * item.quantity; // Use the correct field from your Product model
    totalPrice += productPrice;

    return {
      productName: item.product.name, // Replace 'name' with the actual field in your Product model
      productImage: item.product.image, // Replace 'image' with the actual field in your Product model
      productPrice: item.product.price, // Replace 'price' with the correct field from your Product model
      quantity: item.quantity,
      
    };
  });

  const context = {
    cartList: productDetails,
    totalPrice: totalPrice,
  };

  res.status(200).json({
    status: 'success',
    data: {
      context: context,
    },
  });
});
 


export const placeOrder = catchAsync(async (req, res, next) => {
  const user = req.user.id;
  

  // Fetch all carts for the logged-in user
  const carts = await cartmodel
    .find({ user: user })
    .populate({
      path: 'product',
      populate: {
        path: 'seller', // Replace with the actual path to the seller in your Product schema
        model: 'User',
      },
    });

  if (!carts || carts.length === 0) {
    return next(new AppError('Cart is empty', 404));
  }

  // Initialize variables to store order details
  let totalPrice = 0;
  const productDetails = [];

  // Process each cart
  for (const cart of carts) {
    // Calculate the total price for each cart
    const cartTotalPrice = cart.price * cart.quantity;
    totalPrice += cartTotalPrice;

    // Check if the product has a seller and extract seller information
    const seller = cart.product.seller;
    console.log("selleeeeeeeee",seller)

    if (!seller) {
      return next(new AppError('Seller information not found', 404));
    }

    // Add product details to the list
    productDetails.push({
      product: cart.product._id,
      quantity: cart.quantity,
      productDetails: {
        productName: cart.product.name,
        productImage: cart.product.image[0],
        productPrice: cart.product.price,
        seller: seller, // Include the entire seller object
      },
    });
  }

  // Check if there is at least one product in the cart
  if (productDetails.length === 0) {
    return next(new AppError('No products in the cart', 404));
  }

  // Generate a random tracking number
  const trackingNumber = 'shoppify' + generateRandomNumber();

  // Set the payment method as 'cod'
  const paymentMethod = 'cod';

  // Create a new order
  const order = await bookingmodel.create({
    user: user,
    products: productDetails,
    totalAmount: totalPrice,
    paymentMethod: paymentMethod,
    trackingNumber: trackingNumber,
  });

  // Clear all carts for the user after the successful placement of an order
  await cartmodel.deleteMany({ user: user });

  console.log('Order Placed:');

  // ... Additional logic or responses ...

  res.status(200).json({
    status: 'success',
    data: {
      order: order,
    },
  });
});








// Helper function to generate a random number
function generateRandomNumber() {
  return crypto.randomBytes(3).toString('hex');
}


export const getSellerOrderHistory = catchAsync(async (req, res, next) => {
  const sellerId = req.user.id;

  // Find all bookings where the seller matches the logged-in seller
  const orders = await bookingmodel.find({
    'products.productDetails.seller': sellerId,
  });

  if (!orders || orders.length === 0) {
    return next(new AppError('No order history found for the seller', 404));
  }

  // Transform orders to include only relevant details for the seller
  const sellerOrders = orders.map(order => {
    // Calculate total amount for the seller based on products and quantities
    const sellerTotalAmount = order.products.reduce((total, product) => {
      if (product.productDetails.seller.toString() === sellerId) {
        return total + product.quantity * product.productDetails.productPrice;
      }
      return total;
    }, 0);

    // Return relevant information for the seller
    return {
      orderId: order._id,
      totalAmount: sellerTotalAmount,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber,
      products: order.products.filter(
        product => product.productDetails.seller.toString() === sellerId
      ),
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      orders: sellerOrders,
    },
  });
});
