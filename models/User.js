import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    phone: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['admin', 'customer', 'staff', 'owner'], default: 'customer' },
    // Owner-specific fields
    isRestaurantOwner: { type: Boolean, default: false },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    ownerDetails: {
        businessName: String,
        businessLicense: String,
        taxId: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
