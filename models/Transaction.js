import mongoose from 'mongoose';
const reservationSchema = new mongoose.Schema({
    id: String,
    userId: String,
    restaurantId: String,
    tableId: String,
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
    userName: String,
    userPhone: String,
    specialRequests: String
}, { timestamps: true });
export const Reservation = mongoose.model('Reservation', reservationSchema);
const orderSchema = new mongoose.Schema({
    id: String,
    userId: String,
    restaurantId: String,
    tableId: String,
    tableNumber: Number,
    items: [{
        menuItemId: String,
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'served', 'paid'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    paymentMethod: String
}, { timestamps: true });
export const Order = mongoose.model('Order', orderSchema);
