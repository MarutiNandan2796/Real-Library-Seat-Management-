import User from '../models/User.model';
import Seat from '../models/Seat.model';

/**
 * Initialize system with default admin and seats
 */
export const initializeSystem = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing system...');

    // Create default admin if doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@library.com';
    const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });

    if (!existingAdmin) {
      const admin = await User.create({
        name: process.env.ADMIN_NAME || 'System Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        phone: '9999999999',
        role: 'admin',
        isActive: true,
        isBlocked: false,
      });

      console.log('✅ Default admin created');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Create default seats if none exist
    const seatCount = await Seat.countDocuments();
    if (seatCount === 0) {
      const seats = [];
      for (let i = 1; i <= 50; i++) {
        seats.push({ seatNumber: i });
      }

      await Seat.insertMany(seats);
      console.log('✅ 50 default seats created (1-50)');
    } else {
      console.log(`ℹ️  ${seatCount} seats already exist`);
    }

    console.log('✅ System initialization complete');
  } catch (error) {
    console.error('❌ System initialization failed:', error);
  }
};
