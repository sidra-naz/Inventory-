document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('inventory-form');
    const submitBtn = document.getElementById('submit-btn');
    
    // Inputs
    const productName = document.getElementById('product-name');
    const category = document.getElementById('category');
    const productId = document.getElementById('product-id');
    const quantity = document.getElementById('quantity');
    const price = document.getElementById('price');
    const status = document.getElementById('status');

    // UI Elements
    const qtyMinusBtn = document.getElementById('qty-minus');
    const qtyPlusBtn = document.getElementById('qty-plus');

    // -------------------------------------------------------------
    // Global Toast Function
    // -------------------------------------------------------------
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'ph-check-circle';
        if(type === 'error') iconClass = 'ph-x-circle';
        if(type === 'warning') iconClass = 'ph-warning-circle';
        if(type === 'info') iconClass = 'ph-info';

        toast.innerHTML = `
            <div class="toast-icon"><i class="ph-fill ${iconClass}"></i></div>
            <div class="toast-content">
                <p>${message}</p>
            </div>
        `;
        
        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                if(container.contains(toast)) container.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // -------------------------------------------------------------
    // Helper: Generate Product ID
    // -------------------------------------------------------------
    function generateProductId() {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `PROD-${randomNum}`;
    }

    // Set initial Product ID on load
    productId.value = generateProductId();

    // -------------------------------------------------------------
    // Helper: Show/Hide Errors
    // -------------------------------------------------------------
    const showError = (inputElement, show) => {
        const formGroup = inputElement.closest('.form-group');
        if (show) {
            formGroup.classList.add('input-error');
        } else {
            formGroup.classList.remove('input-error');
        }
        validateForm(); // Re-check overall form validity whenever an error state changes
    };

    // -------------------------------------------------------------
    // Validation Logic
    // -------------------------------------------------------------

    // 1. Product Name (Select)
    productName.addEventListener('change', () => {
        showError(productName, productName.value === "");
    });

    // 2. Category (Select)
    category.addEventListener('change', () => {
        showError(category, category.value === "");
    });

    // 3. Status (Select)
    status.addEventListener('change', () => {
        showError(status, status.value === "");
    });

    // 4. Quantity (Positive Integers Only)
    // Plus/Minus Buttons Logic
    qtyMinusBtn.addEventListener('click', () => {
        let val = parseInt(quantity.value, 10);
        if (isNaN(val)) val = 1;
        if (val > 1) {
            quantity.value = val - 1;
            showError(quantity, false);
            validateForm();
        }
    });

    qtyPlusBtn.addEventListener('click', () => {
        let val = parseInt(quantity.value, 10);
        if (isNaN(val)) val = 0;
        quantity.value = val + 1;
        showError(quantity, false);
        validateForm();
    });

    // Prevent invalid keystrokes entirely
    quantity.addEventListener('keydown', (e) => {
        // Prevent typing: 'e', 'E', '+', '-', '.'
        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
            e.preventDefault();
            showError(quantity, true);
            showToast('Only whole numbers allowed for quantity.', 'error');
            setTimeout(() => {
                if (quantity.value !== "") showError(quantity, false);
            }, 2000);
        }
    });

    quantity.addEventListener('input', (e) => {
        // Ensure it's a positive integer
        let val = parseInt(e.target.value, 10);
        if (e.target.value !== "" && (isNaN(val) || val <= 0)) {
            showError(quantity, true);
        } else if (e.target.value === "") {
            showError(quantity, true);
        } else {
            showError(quantity, false);
        }
        validateForm();
    });

    // 5. Price (Positive numbers, max 2 decimals)
    price.addEventListener('keydown', (e) => {
         // Prevent typing: 'e', 'E', '+', '-'
         if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
            showError(price, true);
            showToast('Invalid character for price.', 'error');
            setTimeout(() => {
                if (price.value !== "") showError(price, false);
            }, 2000);
        }
    });

    price.addEventListener('input', (e) => {
        let val = e.target.value;
        
        // Prevent more than 2 decimal places
        if (val.includes('.')) {
            const parts = val.split('.');
            if (parts[1].length > 2) {
                e.target.value = `${parts[0]}.${parts[1].substring(0, 2)}`;
            }
        }

        const floatVal = parseFloat(e.target.value);
        if (e.target.value !== "" && (isNaN(floatVal) || floatVal <= 0)) {
            showError(price, true);
        } else if (e.target.value === "") {
            showError(price, true);
        } else {
            showError(price, false);
        }
        validateForm();
    });

    // -------------------------------------------------------------
    // Overall Form Validation Check
    // -------------------------------------------------------------
    function validateForm() {
        // Check if all required fields have valid values and no errors
        const hasValidProductName = productName.value !== "";
        const hasValidCategory = category.value !== "";
        const hasValidStatus = status.value !== "";
        
        const qtyVal = parseInt(quantity.value, 10);
        const hasValidQty = quantity.value !== "" && !isNaN(qtyVal) && qtyVal > 0;
        
        const priceVal = parseFloat(price.value);
        const hasValidPrice = price.value !== "" && !isNaN(priceVal) && priceVal > 0;

        // Ensure no field currently has the error class active
        const hasActiveErrors = form.querySelectorAll('.input-error').length > 0;

        if (hasValidProductName && hasValidCategory && hasValidStatus && hasValidQty && hasValidPrice && !hasActiveErrors) {
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.setAttribute('disabled', 'true');
        }
    }

    // -------------------------------------------------------------
    // Form Submission & LocalStorage Simulation
    // -------------------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!submitBtn.hasAttribute('disabled')) {
            const currentId = productId.value;
            
            // Gather data
            const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(el => el.value);
            
            const itemData = {
                id: currentId,
                name: productName.value,
                category: category.value,
                quantity: quantity.value,
                price: price.value,
                status: status.value,
                tags: selectedTags,
                dateAdded: new Date().toISOString()
            };

            // Save to LocalStorage
            try {
                const inventory = JSON.parse(localStorage.getItem('dataInventory')) || [];
                inventory.push(itemData);
                localStorage.setItem('dataInventory', JSON.stringify(inventory));
                
                // Show dynamic success toast with ID
                showToast(`Success! Product ${currentId} has been saved to inventory.`, 'success');
            } catch (err) {
                showToast('Error saving data to local storage.', 'error');
                console.error(err);
                return;
            }
            
            // Reset form after short delay
            setTimeout(() => {
                form.reset();
                
                // Re-initialize specific fields
                quantity.value = 1; 
                productId.value = generateProductId(); // Generate new ID for next entry
                
                // Disable button and remove errors
                submitBtn.setAttribute('disabled', 'true');
                document.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('input-error');
                });
            }, 500);
        }
    });

});
