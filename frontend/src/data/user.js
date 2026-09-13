/**
 * Customer profile & address data for Saravana Women Dresses
 */
export const SAMPLE_USER = {
  id: 'usr-8921',
  name: 'Priyanka Sharma',
  email: 'priyanka.sharma@example.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  memberSince: 'March 2024',
  tier: 'Gold Fashion Privileged Member',
  addresses: [
    {
      id: 'addr-1',
      type: 'Home',
      isDefault: true,
      name: 'Priyanka Sharma',
      street: 'Flat 402, Royal Palms Residency, 2nd Avenue, Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      phone: '+91 98765 43210'
    },
    {
      id: 'addr-2',
      type: 'Work',
      isDefault: false,
      name: 'Priyanka Sharma',
      street: 'Tidel Park, 5th Floor, Rajiv Gandhi Salai, Taramani',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600113',
      phone: '+91 98765 43210'
    }
  ]
};
