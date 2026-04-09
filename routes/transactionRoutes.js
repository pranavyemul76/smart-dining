import express from 'express';
import { Order, Reservation } from '../models/Transaction.js';
import Restaurant from '../models/Restaurant.js';
const router = express.Router();

// Helper to get restaurant ID when requester is a restaurant owner.
const getOwnerRestaurantId = async (userId) => {
    const restaurant = await Restaurant.findOne({
        $or: [
            { ownerId: userId },
            { 'owner.userId': userId }
        ]
    });
    return restaurant ? restaurant._id.toString() : null;
};

// Helper to infer restaurant from a table ID (customer-side ordering flow).
const getRestaurantIdFromTable = async (tableId) => {
    if (!tableId) return null;
    const restaurant = await Restaurant.findOne({ 'tables.id': tableId });
    return restaurant ? restaurant._id.toString() : null;
};
// Orders
router.get('/orders', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID required' });
        const ownerRestaurantId = await getOwnerRestaurantId(userId);
        const orders = ownerRestaurantId
            ? await Order.find({ restaurantId: ownerRestaurantId }).sort({ createdAt: -1 })
            : await Order.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get('/orders/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID required' });
        
        const ownerRestaurantId = await getOwnerRestaurantId(userId);
        const filter = ownerRestaurantId
            ? { id: req.params.id, restaurantId: ownerRestaurantId }
            : { id: req.params.id, userId };
            
        const order = await Order.findOne(filter);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/orders', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID required' });
        const ownerRestaurantId = await getOwnerRestaurantId(userId);
        const inferredRestaurantId =
            req.body.restaurantId ||
            ownerRestaurantId ||
            await getRestaurantIdFromTable(req.body.tableId);
        const orderData = {
            ...req.body,
            userId: req.body.userId || userId,
            restaurantId: inferredRestaurantId || null
        };
        const order = new Order(orderData);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/orders/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID required' });
        const ownerRestaurantId = await getOwnerRestaurantId(userId);
        const filter = ownerRestaurantId
            ? { id: req.params.id, restaurantId: ownerRestaurantId }
            : { id: req.params.id, userId };
        const order = await Order.findOneAndUpdate(
            filter,
            req.body,
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Reservations
router.get('/reservations', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID required' });
        const ownerRestaurantId = await getOwnerRestaurantId(userId);
        const reservations = ownerRestaurantId
            ? await Reservation.find({ restaurantId: ownerRestaurantId }).sort({ createdAt: -1 })
            : await Reservation.find({ userId }).sort({ createdAt: -1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/reservations', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID required' });
        const ownerRestaurantId = await getOwnerRestaurantId(userId);
        const resData = {
            ...req.body,
            userId: req.body.userId || userId,
            restaurantId: req.body.restaurantId || ownerRestaurantId || null
        };
        const reservation = new Reservation(resData);
        await reservation.save();
        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put('/reservations/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) return res.status(401).json({ message: 'User ID required' });
        const ownerRestaurantId = await getOwnerRestaurantId(userId);
        const filter = ownerRestaurantId
            ? { id: req.params.id, restaurantId: ownerRestaurantId }
            : { id: req.params.id, userId };
        const reservation = await Reservation.findOneAndUpdate(
            filter,
            req.body,
            { new: true }
        );
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
