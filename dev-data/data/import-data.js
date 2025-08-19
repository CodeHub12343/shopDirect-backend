const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Product = require('./../../models/productModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
const Category = require('./../../models/categoryModel');
const Order = require('./../../models/orderModel');
const OrderItem = require('./../../models/orderItemModel');

dotenv.config({ path: './config.env' });

const products = JSON.parse(
  fs.readFileSync(`${__dirname}/product.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/categories.json`, 'utf-8')
);
const orders = JSON.parse(fs.readFileSync(`${__dirname}/order.json`, 'utf-8'));

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log('MongoDB successfully connected'));

const importData = async () => {
  try {

   /*  console.log('Importing users...');
    await User.create(users, { validateBeforeSave: false });
    console.log('Users imported successfully');
    // Import categories first (products depend on categories)
        console.log('Importing categories...');
    await Category.create(categories);
    console.log('Categories imported successfully'); */

   /*  console.log('Importing users...');
    await User.create(users, { validateBeforeSave: false });
    console.log('Users imported successfully');

    console.log('Importing products...');
    await Product.create(products);
    console.log('Products imported successfully');

    console.log('Importing reviews...');
    // ✅ No transformation needed since `product` is already in the JSON
    await Review.create(reviews);
    console.log('Reviews imported successfully'); 

    console.log('Importing orders...');
    // Process orders to create OrderItems first, then Orders
    for (const orderData of orders) {
      // Create OrderItems for this order
      const orderItems = [];
      for (const item of orderData.orderItems) {
        const orderItem = await OrderItem.create({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        });
        orderItems.push(orderItem._id);
      }

      // Create the Order with references to OrderItems
      await Order.create({
        user: orderData.user,
        orderItems: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        isDelivered: orderData.isDelivered,
        totalPrice: orderData.totalPrice,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
      });
    }
    console.log('Orders imported successfully');

    console.log('All data imported successfully!'); */
    console.log('Importing orders...');
    // Process orders to create OrderItems first, then Orders
    for (const orderData of orders) {
      // Create OrderItems for this order
      const orderItems = [];
      for (const item of orderData.orderItems) {
        const orderItem = await OrderItem.create({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        });
        orderItems.push(orderItem._id);
      }

      // Create the Order with references to OrderItems
      await Order.create({
        user: orderData.user,
        orderItems: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        isDelivered: orderData.isDelivered,
        totalPrice: orderData.totalPrice,
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
      });
    }
    console.log('Orders imported successfully');

/*     console.log('Importing reviews...');
    // ✅ No transformation needed since `product` is already in the JSON
    await Review.create(reviews);
    console.log('Reviews imported successfully');  */
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    // Delete in reverse order due to dependencies
     /* console.log('Deleting orders...');
    await Order.deleteMany();
    console.log('Orders deleted successfully');

    console.log('Deleting order items...');
    await OrderItem.deleteMany();
    console.log('Order items deleted successfully');

    console.log('Deleting reviews...');
    await Review.deleteMany();
    console.log('Reviews deleted successfully');

    console.log('Deleting products...');
    await Product.deleteMany();
    console.log('Products deleted successfully');

    console.log('Deleting users...');
    await User.deleteMany();
    console.log('Users deleted successfully'); 

      console.log('Deleting categories...');
    await Category.deleteMany();
    console.log('Categories deleted successfully'); 

    
    console.log('Deleting users...');
    await User.deleteMany();
    console.log('Users deleted successfully');

    console.log('All data deleted successfully!');

    console.log('Deleting reviews...');
    await Review.deleteMany();
    console.log('Reviews deleted successfully');*/
    console.log('Deleting orders...');
    await Order.deleteMany();
    console.log('Orders deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

console.log(process.argv);

if (process.argv.includes('--import')) {
  importData();
} else if (process.argv.includes('--delete')) {
  deleteData();
}
