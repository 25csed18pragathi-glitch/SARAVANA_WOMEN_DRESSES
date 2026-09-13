import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';

dotenv.config();

const seedAdminAndOrders = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const seedCustomerPassword = process.env.SEED_CUSTOMER_PASSWORD;
    if (!adminEmail || !adminPassword || !seedCustomerPassword) throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD, and SEED_CUSTOMER_PASSWORD are required');
    await connectDB();
    console.log('MongoDB connected. Initializing Admin, Customers, Orders, and Reviews...');

    // 1. Seed or Verify Default Admin
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Saravana Store Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: process.env.ADMIN_PHONE || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      });
      console.log('✅ Default Admin account created:', adminEmail);
    } else {
      console.log('ℹ️ Admin account already exists:', adminEmail);
    }

    // 2. Seed Sample Customers
    const sampleCustomers = [
      {
        name: 'Priyanka Sharma',
        email: 'priyanka.sharma@example.com',
        password: seedCustomerPassword,
        role: 'customer',
        phone: '+91 98401 23456',
        addresses: [
          {
            type: 'Home',
            name: 'Priyanka Sharma',
            street: '42, Cathedral Road, Gopalapuram',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600086',
            phone: '+91 98401 23456',
            isDefault: true
          }
        ]
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@example.com',
        password: seedCustomerPassword,
        role: 'customer',
        phone: '+91 94440 98765',
        addresses: [
          {
            type: 'Home',
            name: 'Ananya Iyer',
            street: '15, Luz Church Road, Mylapore',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600004',
            phone: '+91 94440 98765',
            isDefault: true
          }
        ]
      },
      {
        name: 'Deepika Patel',
        email: 'deepika.patel@example.com',
        password: seedCustomerPassword,
        role: 'customer',
        phone: '+91 98800 11223',
        addresses: [
          {
            type: 'Home',
            name: 'Deepika Patel',
            street: '88, Race Course Road',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pincode: '641018',
            phone: '+91 98800 11223',
            isDefault: true
          }
        ]
      }
    ];

    const customerDocs = [];
    for (const c of sampleCustomers) {
      let doc = await User.findOne({ email: c.email });
      if (!doc) {
        doc = await User.create(c);
        console.log(`✅ Seeded customer: ${c.name} (${c.email})`);
      }
      customerDocs.push(doc);
    }

    // 3. Seed Sample Orders if fewer than 5 orders exist
    const existingOrdersCount = await Order.countDocuments();
    if (existingOrdersCount < 5) {
      const allProducts = await Product.find().limit(6);
      if (allProducts.length > 0) {
        const sampleOrders = [
          {
            orderNumber: 'SWD-2026-1001',
            user: customerDocs[0]._id,
            customer: {
              name: customerDocs[0].name,
              email: customerDocs[0].email,
              phone: customerDocs[0].phone,
              shippingAddress: customerDocs[0].addresses[0]
            },
            items: [
              {
                product: allProducts[0]._id,
                name: allProducts[0].name,
                image: allProducts[0].images[0] || allProducts[0].image,
                price: allProducts[0].finalPrice || allProducts[0].price,
                size: allProducts[0].sizes[0] || 'Free Size',
                color: allProducts[0].colors[0]?.name || 'Crimson Red',
                quantity: 1
              }
            ],
            totalAmount: allProducts[0].finalPrice || allProducts[0].price,
            status: 'Delivered',
            paymentMethod: 'COD',
            paymentStatus: 'Paid',
            timeline: [
              { status: 'Ordered', timestamp: new Date(Date.now() - 5 * 86400000), note: 'Order placed by customer' },
              { status: 'Confirmed', timestamp: new Date(Date.now() - 4 * 86400000), note: 'Order verified by seller' },
              { status: 'Packed', timestamp: new Date(Date.now() - 3 * 86400000), note: 'Packed with luxury festive gift box' },
              { status: 'Shipped', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Dispatched via BlueDart Express' },
              { status: 'Out for Delivery', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Out for doorstep delivery' },
              { status: 'Delivered', timestamp: new Date(Date.now() - 12 * 3600000), note: 'Delivered and paid via COD' }
            ]
          },
          {
            orderNumber: 'SWD-2026-1002',
            user: customerDocs[1]._id,
            customer: {
              name: customerDocs[1].name,
              email: customerDocs[1].email,
              phone: customerDocs[1].phone,
              shippingAddress: customerDocs[1].addresses[0]
            },
            items: [
              {
                product: allProducts[1]._id,
                name: allProducts[1].name,
                image: allProducts[1].images[0] || allProducts[1].image,
                price: allProducts[1].finalPrice || allProducts[1].price,
                size: allProducts[1].sizes[0] || 'M',
                color: allProducts[1].colors[0]?.name || 'Royal Blue',
                quantity: 1
              }
            ],
            totalAmount: allProducts[1].finalPrice || allProducts[1].price,
            status: 'Shipped',
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            timeline: [
              { status: 'Ordered', timestamp: new Date(Date.now() - 3 * 86400000), note: 'Order placed' },
              { status: 'Confirmed', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Order confirmed' },
              { status: 'Packed', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Quality check passed' },
              { status: 'Shipped', timestamp: new Date(Date.now() - 14 * 3600000), note: 'In transit to Mylapore hub' }
            ]
          },
          {
            orderNumber: 'SWD-2026-1003',
            user: customerDocs[2]._id,
            customer: {
              name: customerDocs[2].name,
              email: customerDocs[2].email,
              phone: customerDocs[2].phone,
              shippingAddress: customerDocs[2].addresses[0]
            },
            items: [
              {
                product: allProducts[2]._id,
                name: allProducts[2].name,
                image: allProducts[2].images[0] || allProducts[2].image,
                price: allProducts[2].finalPrice || allProducts[2].price,
                size: allProducts[2].sizes[0] || 'L',
                color: allProducts[2].colors[0]?.name || 'Emerald Green',
                quantity: 2
              }
            ],
            totalAmount: (allProducts[2].finalPrice || allProducts[2].price) * 2,
            status: 'Confirmed',
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            timeline: [
              { status: 'Ordered', timestamp: new Date(Date.now() - 24 * 3600000), note: 'Order placed' },
              { status: 'Confirmed', timestamp: new Date(Date.now() - 6 * 3600000), note: 'Seller verified order details' }
            ]
          },
          {
            orderNumber: 'SWD-2026-1004',
            user: customerDocs[0]._id,
            customer: {
              name: customerDocs[0].name,
              email: customerDocs[0].email,
              phone: customerDocs[0].phone,
              shippingAddress: customerDocs[0].addresses[0]
            },
            items: [
              {
                product: allProducts[3]._id,
                name: allProducts[3].name,
                image: allProducts[3].images[0] || allProducts[3].image,
                price: allProducts[3].finalPrice || allProducts[3].price,
                size: allProducts[3].sizes[0] || 'Free Size',
                color: allProducts[3].colors[0]?.name || 'Gold',
                quantity: 1
              }
            ],
            totalAmount: allProducts[3].finalPrice || allProducts[3].price,
            status: 'Ordered',
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            timeline: [
              { status: 'Ordered', timestamp: new Date(), note: 'Customer checkout completed' }
            ]
          }
        ];

        for (const ord of sampleOrders) {
          await Order.findOneAndUpdate({ orderNumber: ord.orderNumber }, ord, { upsert: true, new: true });
        }
        console.log(`✅ Seeded ${sampleOrders.length} sample orders`);
      }
    } else {
      console.log(`ℹ️ Orders already present: ${existingOrdersCount}`);
    }

    // 4. Seed Sample Reviews if none exist
    const existingReviewsCount = await Review.countDocuments();
    if (existingReviewsCount === 0) {
      const allProducts = await Product.find().limit(4);
      if (allProducts.length > 0 && customerDocs.length > 0) {
        const sampleReviews = [
          {
            product: allProducts[0]._id,
            user: customerDocs[0]._id,
            customerName: customerDocs[0].name,
            rating: 5,
            comment: 'Absolutely stunning weave and authentic silk luster! Received so many compliments at my cousin’s wedding.',
            status: 'approved'
          },
          {
            product: allProducts[1]._id,
            user: customerDocs[1]._id,
            customerName: customerDocs[1].name,
            rating: 4,
            comment: 'Very comfortable fabric and true to size fit. Color is slightly darker than picture but very elegant.',
            status: 'approved'
          },
          {
            product: allProducts[2]._id,
            user: customerDocs[2]._id,
            customerName: customerDocs[2].name,
            rating: 5,
            comment: 'Exquisite embroidery and premium packaging. Fast doorstep delivery in 2 days!',
            status: 'approved'
          }
        ];

        await Review.insertMany(sampleReviews);
        console.log(`✅ Seeded ${sampleReviews.length} sample reviews`);
      }
    } else {
      console.log(`ℹ️ Reviews already present: ${existingReviewsCount}`);
    }

    console.log('🎉 Admin and sample order seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during admin & order seeding:', error);
    process.exit(1);
  }
};

seedAdminAndOrders();
