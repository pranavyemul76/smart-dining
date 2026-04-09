import mongoose from 'mongoose';
import Restaurant from './models/Restaurant.js';
import RestaurantOwner from './models/RestaurantOwner.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_dining';

async function debug() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const owners = await RestaurantOwner.find({});
        console.log(`\nFound ${owners.length} Owners:`);
        owners.forEach(o => {
            console.log(`- ID: ${o._id}, Name: ${o.name}, Email: ${o.email}, Role: ${o.role}, RestID: ${o.restaurantId}`);
        });

        const restaurants = await Restaurant.find({});
        console.log(`\nFound ${restaurants.length} Restaurants:`);
        restaurants.forEach(r => {
            console.log(`- ID: ${r._id}, Name: ${r.name}, OwnerID: ${r.ownerId}`);
            console.log(`  Tables: ${r.tables.length}, Menu Items: ${r.menu.length}`);
        });

        console.log('\nChecking relationships...');
        for (const r of restaurants) {
            const owner = await RestaurantOwner.findById(r.ownerId);
            if (!owner) {
                console.error(`[ERROR] Restaurant ${r.name} (${r._id}) has ownerId ${r.ownerId} BUT NO MATCHING OWNER FOUND!`);
            } else {
                console.log(`[OK] Restaurant ${r.name} maps to Owner ${owner.name}`);
                if (owner.restaurantId && r._id.toString() !== owner.restaurantId.toString()) {
                    console.error(`[WARNING] Owner ${owner.name} has restaurantId ${owner.restaurantId} but Restaurant ${r.name} is ${r._id}`);
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
