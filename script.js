// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCPZDMjh7HS5b7az9X5UXwcTqPB3UpYY5E",
    authDomain: "dodd-poultry-fam.firebaseapp.com",
    databaseURL: "https://dodd-poultry-fam-default-rtdb.firebaseio.com",
    projectId: "dodd-poultry-fam",
    storageBucket: "dodd-poultry-fam.firebasestorage.app",
    messagingSenderId: "277644831370",
    appId: "1:277644831370:web:ae48a472b3f852c09d1b73"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let inventory = {};

// Load real-time inventory
function loadInventory() {
    db.ref('inventory').on('value', (snapshot) => {
        inventory = snapshot.val() || {};
        updateProductStatuses();
    });
}

// Update status and buttons
function updateProductStatuses() {
    const products = ['Eggs', 'Chicks', 'Hens', 'Roosters'];
    
    products.forEach(name => {
        const stock = inventory[name] !== undefined ? inventory[name] : 0;
        const statusEl = document.getElementById(`status-${name}`);
        const addBtn = document.querySelector(`button[data-name="${name}"]`);
        const stripeBtn = document.querySelector(`a[href*="${name.toLowerCase()}"]`);

        if (statusEl) {
            if (stock <= 0) {
                statusEl.textContent = "Out of Stock";
                statusEl.className = "out-of-stock";
            } else if (stock <= 5) {
                statusEl.textContent = `Low Stock (${stock} left)`;
                statusEl.className = "limited";
            } else {
                statusEl.textContent = `In Stock (${stock} left)`;
                statusEl.className = "available";
            }
        }

        if (addBtn) addBtn.disabled = (stock <= 0);
        if (stripeBtn) {
            stripeBtn.style.opacity = (stock <= 0) ? "0.5" : "1";
            stripeBtn.style.pointerEvents = (stock <= 0) ? "none" : "auto";
        }
    });
}

// Cart Functions
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
    const countEl = document.getElementById('cart-count');
    const itemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    let total = 0;
    itemsEl.innerHTML = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <strong>${item.name}</strong><br>
            ${item.quantity} × $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}
            <button onclick="removeFromCart(${index})" style="float:right; background:#ff9800; font-size:0.8em;">Remove</button>
        `;
        itemsEl.appendChild(div);
    });

    countEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    totalEl.textContent = total.toFixed(2);
}

function addToCart(name, price) {
    const stock = inventory[name] !== undefined ? inventory[name] : 0;
    if (stock <= 0) {
        alert("Sorry, this item is currently out of stock!");
        return;
    }

    const quantityInput = event.currentTarget.parentElement.querySelector('.quantity');
    let quantity = parseInt(quantityInput.value) || 1;
    if (quantity > stock) quantity = stock;

    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ name, price: parseFloat(price), quantity });
    }

    saveCart();
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
}

function clearCart() {
    if (confirm("Clear entire cart?")) {
        cart = [];
        saveCart();
        updateCartDisplay();
    }
}

function viewCart() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    let modal = document.getElementById('cart-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cart-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 1000; font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; width: 420px; max-width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden;">
                <div style="background: #6B8E23; color: white; padding: 15px 20px; font-size: 18px; font-weight: bold;">
                    🛒 Your Cart
                </div>
                <div id="modal-cart-items" style="padding: 20px; max-height: 400px; overflow-y: auto;"></div>
                <div style="padding: 15px 20px; border-top: 1px solid #eee; background: #f9f9f9;">
                    <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
                        Total: $<span id="modal-cart-total" style="color: #6B8E23;"></span>
                    </p>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="closeCartModal()" style="flex:1; padding:12px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer;">Close</button>
                        <button onclick="proceedToCheckout()" style="flex:1; padding:12px; background:#6B8E23; color:white; border:none; border-radius:6px; cursor:pointer;">Checkout</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const itemsContainer = document.getElementById('modal-cart-items');
    const totalEl = document.getElementById('modal-cart-total');
    
    let itemsHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHTML += `
            <div style="padding:12px 0; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
                <div><strong>${item.quantity} × ${item.name}</strong></div>
                <div>$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });

    itemsContainer.innerHTML = itemsHTML || '<p style="color:#888; text-align:center;">Cart is empty</p>';
    totalEl.textContent = total.toFixed(2);
    modal.style.display = 'flex';
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'none';
}

function proceedToCheckout() {
    closeCartModal();
    alert("Payment options coming soon!\nYou can use the individual Stripe buttons for now.");
}

// Check for successful Stripe payment
function checkPaymentSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const product = urlParams.get('product');
        const qty = parseInt(urlParams.get('qty')) || 1;

        if (product) {
            db.ref('inventory/' + product).transaction((current) => {
                return Math.max(0, (current || 0) - qty);
            });

            setTimeout(() => {
                alert(`Thank you for purchasing ${qty} × ${product}! Stock updated.`);
            }, 800);

            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

// Attach event listeners
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const name = this.getAttribute('data-name');
        const price = this.getAttribute('data-price');
        addToCart(name, price);
    });
});

// Initialize
loadInventory();
updateCartDisplay();
checkPaymentSuccess();
