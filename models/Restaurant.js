import mongoose from 'mongoose';
const menuItemSchema = new mongoose.Schema({
    id: String,
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: String,
    isAvailable: { type: Boolean, default: true }
});
const tableSchema = new mongoose.Schema({
    id: String,
    tableNumber: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, default: 'available' },
    qrCode: String,
    location: String
});
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cuisineType: String,
    description: String,
    openingTime: String,
    closingTime: String,
    image: String,
    images: [String],
    // Owner Reference
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'RestaurantOwner' },
    // Owner Details (denormalized for quick access)
    owner: {
        userId: mongoose.Schema.Types.ObjectId,
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        photo: String
    },
    whenStarted: String,
    speciality: String,
    parkingAvailability: Boolean,
    tables: [tableSchema],
    menu: [menuItemSchema],
    // Restaurant status
    isActive: { type: Boolean, default: true },
    registeredAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });
export default mongoose.model('Restaurant', restaurantSchema);
