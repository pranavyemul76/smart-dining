import express from 'express';
import RestaurantOwner from '../models/RestaurantOwner.js';
import Restaurant from '../models/Restaurant.js';
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password, phone, otp } = req.body;
        let owner;

        if (email) {
            owner = await RestaurantOwner.findOne({ email, password });
            if (!owner) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else if (phone) {
            // Simulated OTP for demo (accept '1234')
            if (otp !== '1234') {
                return res.status(401).json({ message: 'Invalid OTP' });
            }
            owner = await RestaurantOwner.findOne({ phone });
            if (!owner) {
                return res.status(401).json({ message: 'Phone not registered' });
            }
        } else {
            return res.status(400).json({ message: 'Email or phone required' });
        }

        // Auto-repair missing owner.restaurantId if a restaurant already exists for this owner.
        if (!owner.restaurantId) {
            const existingRestaurant = await Restaurant.findOne({
                $or: [
                    { ownerId: owner._id },
                    { 'owner.userId': owner._id }
                ]
            }).select('_id');
            if (existingRestaurant) {
                const repairedOwner = await RestaurantOwner.findByIdAndUpdate(
                    owner._id,
                    { restaurantId: existingRestaurant._id, updatedAt: new Date() },
                    { new: true }
                );
                if (repairedOwner) {
                    owner = repairedOwner;
                }
            }
        }

        const normalizedRestaurantId =
            owner.restaurantId && typeof owner.restaurantId === 'object'
                ? (owner.restaurantId._id || owner.restaurantId.id || null)
                : owner.restaurantId;

        // Return owner with MongoDB ID field
        const response = {
            id: owner._id,
            _id: owner._id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
            role: owner.role,
            restaurantId: normalizedRestaurantId,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (email) {
            const existing = await RestaurantOwner.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already exists' });
        }
        if (phone) {
            const existing = await RestaurantOwner.findOne({ phone });
            if (existing) return res.status(400).json({ message: 'Phone already exists' });
        }

        const ownerData = {
            ...req.body,
            role: 'owner'
        };

        const owner = new RestaurantOwner(ownerData);
        await owner.save();

        // Return owner with MongoDB ID field
        const response = {
            id: owner._id,
            _id: owner._id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone,
            role: owner.role,
            restaurantId: owner.restaurantId,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt
        };

        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const owner = await RestaurantOwner.findById(req.params.id).populate('restaurantId');
        if (!owner) return res.status(404).json({ message: 'Owner not found' });
        res.json(owner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
