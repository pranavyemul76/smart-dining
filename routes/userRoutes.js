import express from 'express';
import User from '../models/User.js';
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password, phone, otp } = req.body;
        let user;
        
        if (email) {
            user = await User.findOne({ email, password }).populate('restaurantId');
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
        } else if (phone) {
            // Simulated OTP for demo (accept '1234')
            if (otp !== '1234') {
                return res.status(401).json({ message: 'Invalid OTP' });
            }
            user = await User.findOne({ phone }).populate('restaurantId');
            if (!user) {
                return res.status(401).json({ message: 'Phone not registered' });
            }
        } else {
            return res.status(400).json({ message: 'Email or phone required' });
        }

        // Return user with MongoDB ID field
        const userResponse = {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isRestaurantOwner: user.isRestaurantOwner,
            restaurantId: user.restaurantId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/phone/:phone', async (req, res) => {
    try {
        const user = await User.findOne({ phone: req.params.phone }).populate('restaurantId');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Return user with MongoDB ID field
        const userResponse = {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isRestaurantOwner: user.isRestaurantOwner,
            restaurantId: user.restaurantId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (email) {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already exists' });
        }
        if (phone) {
            const existing = await User.findOne({ phone });
            if (existing) return res.status(400).json({ message: 'Phone already exists' });
        }
        
        const userData = {
            ...req.body,
            role: req.body.role || 'customer',
            isRestaurantOwner: false
        };
        
        const user = new User(userData);
        await user.save();
        
        // Return user with MongoDB ID field
        const userResponse = {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isRestaurantOwner: user.isRestaurantOwner,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('restaurantId');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get restaurant owners
router.get('/owners/list', async (req, res) => {
    try {
        const owners = await User.find({ isRestaurantOwner: true }).populate('restaurantId');
        res.json(owners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
