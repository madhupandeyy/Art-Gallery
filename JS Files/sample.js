const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Use cors for potential cross-origin requests

const app = express();

// Mongoose connection and schema
const mongoURI = 'mongodb://localhost:27017/ArtGallery';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Schema for products
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  // Other product details as needed
});

const Product = mongoose.model('Product', ProductSchema);

// Schema for cart (assuming user authentication is implemented)
const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  }],
  // Other cart details as needed
});

const Cart = mongoose.model('Cart', CartSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route to add an item to the cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Please provide product ID and quantity' });
    }

    // Validate product ID is valid
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find user's cart (assuming user authentication is implemented)
    const user = req.user; // Replace with your authentication mechanism
    const cart = await Cart.findOne({ user });

    // Create new cart if it doesn't exist
    if (!cart) {
      const newCart = new Cart({ user });
      cart = await newCart.save();
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(item => item.product.equals(productId));

    // Update quantity if product exists
    if (existingItem) {
      existingItem.quantity += quantity;
      await cart.save();
    } else {
      // Add new item to cart
      cart.items.push({ product, quantity });
      await cart.save();
    }

    res.status(200).json({ message: 'Product added to cart' });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Other routes and configurations for your application

const port = process.env.PORT || 3000; // Use environment variables for flexibility
app.listen(port, () => console.log(`Server listening on port ${port}`));