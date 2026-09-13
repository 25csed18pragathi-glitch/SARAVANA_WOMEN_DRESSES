/**
 * Sample orders data for Saravana Women Dresses
 * Amazon/Meesho style orders with 6-stage delivery timelines
 */
export const SAMPLE_ORDERS = [
  {
    id: 'SWD-2026-98412',
    orderDate: '10 Sep 2026',
    estimatedDelivery: '14 Sep 2026',
    deliveredDate: null,
    currentStep: 4, // 0: Ordered, 1: Confirmed, 2: Packed, 3: Shipped, 4: Out for Delivery, 5: Delivered
    statusText: 'Out for Delivery',
    paymentStatus: 'Paid Online via UPI',
    paymentMethod: 'UPI (Google Pay)',
    totalAmount: 4299,
    deliveryFee: 0,
    discountApplied: 500,
    shippingAddress: {
      name: 'Priyanka Sharma',
      street: 'Flat 402, Royal Palms Residency, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      phone: '+91 98765 43210'
    },
    items: [
      {
        id: 'prod-01',
        name: 'Kanjeevaram Gold Zari Silk Saree',
        brand: 'Saravana Silk Heritage',
        category: 'Sarees',
        size: 'Free Size',
        color: 'Royal Crimson',
        price: 4299,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'
      }
    ],
    timeline: [
      { step: 'Ordered', title: 'Order Placed', time: '10 Sep 2026, 09:30 AM', completed: true },
      { step: 'Confirmed', title: 'Order Confirmed', time: '10 Sep 2026, 11:15 AM', completed: true },
      { step: 'Packed', title: 'Packed at Chennai Hub', time: '11 Sep 2026, 03:45 PM', completed: true },
      { step: 'Shipped', title: 'Shipped via Bluedart Express', time: '12 Sep 2026, 08:20 AM', completed: true },
      { step: 'Out for Delivery', title: 'Out for Delivery with Courier Agent', time: '12 Sep 2026, 11:00 AM', completed: true, active: true },
      { step: 'Delivered', title: 'Expected Delivery', time: 'Expected by 07:00 PM Today', completed: false }
    ]
  },
  {
    id: 'SWD-2026-92140',
    orderDate: '02 Sep 2026',
    estimatedDelivery: '05 Sep 2026',
    deliveredDate: '05 Sep 2026, 04:15 PM',
    currentStep: 5,
    statusText: 'Delivered',
    paymentStatus: 'Paid Online',
    paymentMethod: 'Credit Card',
    totalAmount: 4398,
    deliveryFee: 0,
    discountApplied: 300,
    shippingAddress: {
      name: 'Priyanka Sharma',
      street: 'Flat 402, Royal Palms Residency, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      phone: '+91 98765 43210'
    },
    items: [
      {
        id: 'prod-02',
        name: 'Handcrafted Anarkali Kurti & Dupatta Set',
        brand: 'Biba',
        category: 'Kurtis',
        size: 'M',
        color: 'Rose Quartz',
        price: 2499,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'prod-04',
        name: 'Floral Bohemian Tiered Maxi Dress',
        brand: 'Global Desi',
        category: 'Western Wear',
        size: 'S',
        color: 'Buttercup Yellow',
        price: 1899,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80'
      }
    ],
    timeline: [
      { step: 'Ordered', title: 'Order Placed', time: '02 Sep 2026, 02:15 PM', completed: true },
      { step: 'Confirmed', title: 'Order Confirmed', time: '02 Sep 2026, 03:00 PM', completed: true },
      { step: 'Packed', title: 'Packed at Hub', time: '03 Sep 2026, 10:00 AM', completed: true },
      { step: 'Shipped', title: 'Shipped via Express Post', time: '03 Sep 2026, 06:30 PM', completed: true },
      { step: 'Out for Delivery', title: 'Out for Delivery', time: '05 Sep 2026, 09:30 AM', completed: true },
      { step: 'Delivered', title: 'Delivered to Customer', time: '05 Sep 2026, 04:15 PM', completed: true, active: true }
    ]
  },
  {
    id: 'SWD-2026-87632',
    orderDate: '24 Aug 2026',
    estimatedDelivery: '28 Aug 2026',
    deliveredDate: '28 Aug 2026, 01:20 PM',
    currentStep: 5,
    statusText: 'Delivered',
    paymentStatus: 'Cash on Delivery',
    paymentMethod: 'Cash on Delivery',
    totalAmount: 1199,
    deliveryFee: 49,
    discountApplied: 0,
    shippingAddress: {
      name: 'Priyanka Sharma',
      street: 'Flat 402, Royal Palms Residency, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      phone: '+91 98765 43210'
    },
    items: [
      {
        id: 'prod-07',
        name: 'Ruffled Puff-Sleeve Peplum Top',
        brand: 'AND',
        category: 'Tops',
        size: 'M',
        color: 'Ivory White',
        price: 1199,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=400&q=80'
      }
    ],
    timeline: [
      { step: 'Ordered', title: 'Order Placed', time: '24 Aug 2026, 11:00 AM', completed: true },
      { step: 'Confirmed', title: 'Order Confirmed', time: '24 Aug 2026, 11:45 AM', completed: true },
      { step: 'Packed', title: 'Packed at Hub', time: '25 Aug 2026, 02:00 PM', completed: true },
      { step: 'Shipped', title: 'Shipped', time: '26 Aug 2026, 09:00 AM', completed: true },
      { step: 'Out for Delivery', title: 'Out for Delivery', time: '28 Aug 2026, 10:00 AM', completed: true },
      { step: 'Delivered', title: 'Delivered & Cash Collected', time: '28 Aug 2026, 01:20 PM', completed: true, active: true }
    ]
  }
];
