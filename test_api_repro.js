import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api';

async function testRestaurantFlow() {
    try {
        console.log('--- Starting Restaurant Data Persistence Test ---');

        // 1. Create a random user
        const randomStr = Math.random().toString(36).substring(7);
        const userEmail = `testuser_${randomStr}@test.com`;
        const userPassword = 'password123';

        console.log(`1. Registering user: ${userEmail}`);
        const registerRes = await axios.post(`${API_URL}/restaurant-owners/register`, {
            name: 'Test Owner',
            email: userEmail,
            password: userPassword,
            phone: `123456789${Math.floor(Math.random() * 10)}`
        });

        const user = registerRes.data;
        const userId = user.id || user._id;
        console.log(`   User registered with ID: ${userId}`);

        // 2. Prepare restaurant data with tables and menu
        const restaurantData = {
            name: `Test Restaurant ${randomStr}`,
            address: '123 Test St',
            contactNumber: '555-555-5555',
            email: `restaurant_${randomStr}@test.com`,
            cuisineType: 'Test Cuisine',
            description: 'A test restaurant',
            openingTime: '09:00',
            closingTime: '22:00',
            owner: {
                userId: userId,
                name: 'Test Owner',
                email: userEmail,
                phone: user.phone || '555-555-5555'
            },
            tables: [
                {
                    id: `table-${Date.now()}-1`,
                    tableNumber: 1,
                    capacity: 4,
                    status: 'available',
                    location: 'Main Hall'
                },
                {
                    id: `table-${Date.now()}-2`,
                    tableNumber: 2,
                    capacity: 2,
                    status: 'available',
                    location: 'Patio'
                }
            ],
            menu: [
                {
                    id: `menu-${Date.now()}-1`,
                    name: 'Test Burger',
                    description: 'Delicious test burger',
                    price: 15.99,
                    category: 'main',
                    image: 'http://example.com/burger.jpg',
                    isAvailable: true
                },
                {
                    id: `menu-${Date.now()}-2`,
                    name: 'Test Drink',
                    description: 'Refreshing test drink',
                    price: 4.99,
                    category: 'beverage',
                    image: 'http://example.com/drink.jpg',
                    isAvailable: true
                }
            ]
        };

        console.log(`2. Saving restaurant profile with ${restaurantData.tables.length} tables and ${restaurantData.menu.length} menu items...`);

        const saveRes = await axios.post(`${API_URL}/restaurant/profile`, restaurantData, {
            headers: { 'x-user-id': userId }
        });

        const savedRestaurant = saveRes.data;
        console.log(`   Restaurant saved. ID: ${savedRestaurant._id || savedRestaurant.id}`);
        console.log(`   Saved tables count: ${savedRestaurant.tables?.length}`);
        console.log(`   Saved menu count: ${savedRestaurant.menu?.length}`);

        // Define verify function with specific scope
        const verifyData = (source, tables, menu) => {
            if (tables?.length !== 2) {
                console.error(`❌ [${source}] Table count mismatch! Expected 2, got ${tables?.length}`);
            } else {
                console.log(`✅ [${source}] Table count correct (2)`);
            }

            if (menu?.length !== 2) {
                console.error(`❌ [${source}] Menu count mismatch! Expected 2, got ${menu?.length}`);
            } else {
                console.log(`✅ [${source}] Menu count correct (2)`);
            }
        };

        verifyData('Save Response', savedRestaurant.tables, savedRestaurant.menu);

        // 3. Fetch profile to verify persistence
        console.log('3. Fetching restaurant profile to verify persistence...');
        const fetchRes = await axios.get(`${API_URL}/restaurant/profile`, {
            headers: { 'x-user-id': userId }
        });

        const fetchedRestaurant = fetchRes.data;
        console.log(`   Fetched tables count: ${fetchedRestaurant.tables?.length}`);
        console.log(`   Fetched menu count: ${fetchedRestaurant.menu?.length}`);

        verifyData('Fetch Response', fetchedRestaurant.tables, fetchedRestaurant.menu);

        if (fetchedRestaurant.tables?.length === 2 && fetchedRestaurant.menu?.length === 2) {
            console.log('\n✅ TEST PASSED: Tables and Menu were correctly saved and retrieved.');
        } else {
            console.log('\n❌ TEST FAILED: Data was lost during save/retrieve process.');
        }

    } catch (error) {
        console.error('Test Execution Error:', error.response?.data || error.message);
    }
}

testRestaurantFlow();
