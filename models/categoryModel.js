import mongoose from 'mongoose';
import validator from 'validator';
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us the category!'],
    maxlength: [30,"cant specify more than 30 letters"],
    unique:[true,'this category already specified']
  }
 
 
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
