// script.js

// Shopping Cart Management
let cart = [];

function addToCart(productId, quantity) {
    cart.push({ productId, quantity });
    console.log(`Added ${quantity} of product ${productId} to the cart.`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    console.log(`Removed product ${productId} from the cart.`);
}

function viewCart() {
    console.log('Current Cart:', cart);
}

// Product Inventory Tracking
let inventory = {};

function updateInventory(productId, quantity) {
    inventory[productId] = quantity;
    console.log(`Updated inventory for product ${productId}: ${quantity}`);
}

function checkStock(productId) {
    return inventory[productId] || 0;
}

// Customer Email Subscription System
let subscribers = [];

function subscribeEmail(email) {
    subscribers.push(email);
    console.log(`Subscribed ${email} for notifications.`);
}

// Seasonal Product Availability Updates
let seasonalItems = [];

function updateSeasonalItems(items) {
    seasonalItems = items;
    console.log('Updated seasonal items:', seasonalItems);
}

// Interactive UI Elements
function toggleProductDetails(productId) {
    const productDetails = document.getElementById(`details-${productId}`);
    productDetails.style.display = productDetails.style.display === 'none' ? 'block' : 'none';
}

// Sample usage
subscribeEmail('example@example.com');
addToCart('p1', 2);
updateInventory('p1', 10);
updateSeasonalItems(['turkey', 'ham']);