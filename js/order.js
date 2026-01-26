/* ============================================
   PHARMACIE GHANDOUR - Gestion des Commandes
   ============================================ */

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    const isOrderPage = window.location.pathname.includes('commande.html');
    const isConfirmPage = window.location.pathname.includes('confirmation.html');

    if (isOrderPage) {
        // Attendre le chargement des produits
        if (window.PharmacieApp && window.PharmacieApp.getProducts().length > 0) {
            initOrderPage();
        } else {
            document.addEventListener('productsLoaded', initOrderPage);
        }
    }

    if (isConfirmPage) {
        displayConfirmation();
    }
});

/* ============================================
   Page Commande
   ============================================ */
function initOrderPage() {
    // Vérifier si le panier n'est pas vide
    const cart = window.PharmacieApp.getCart();
    if (cart.length === 0) {
        window.location.href = 'panier.html';
        return;
    }

    // Afficher le récapitulatif
    if (window.CartManager) {
        window.CartManager.displayOrderSummary();
    }

    // Initialiser le formulaire
    initOrderForm();

    // Générer les créneaux horaires
    generateTimeSlots();
}

function initOrderForm() {
    const form = document.getElementById('order-form');
    if (!form) return;

    // Validation en temps réel
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });

    // Soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder(form);
    });
}

/* ============================================
   Validation
   ============================================ */
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'nom':
            if (!value) {
                isValid = false;
                errorMessage = 'Le nom est requis';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Le nom doit contenir au moins 2 caractères';
            }
            break;

        case 'prenom':
            if (!value) {
                isValid = false;
                errorMessage = 'Le prénom est requis';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Le prénom doit contenir au moins 2 caractères';
            }
            break;

        case 'telephone':
            if (!value) {
                isValid = false;
                errorMessage = 'Le téléphone est requis';
            } else if (!validateSenegalPhone(value)) {
                isValid = false;
                errorMessage = 'Numéro de téléphone sénégalais invalide (ex: 77 123 45 67)';
            }
            break;

        case 'email':
            if (!value) {
                isValid = false;
                errorMessage = 'L\'email est requis';
            } else if (!validateEmail(value)) {
                isValid = false;
                errorMessage = 'Adresse email invalide';
            }
            break;

        case 'heure_retrait':
            if (!value) {
                isValid = false;
                errorMessage = 'Veuillez sélectionner un créneau de retrait';
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateSenegalPhone(phone) {
    // Nettoyer le numéro
    const cleaned = phone.replace(/[\s\-\.]/g, '');

    // Formats acceptés:
    // +221 XX XXX XX XX
    // 221 XX XXX XX XX
    // 0XX XXX XX XX
    // XX XXX XX XX
    const patterns = [
        /^\+221[7][0-8]\d{7}$/,     // +221 7X XXX XX XX
        /^221[7][0-8]\d{7}$/,       // 221 7X XXX XX XX
        /^0[7][0-8]\d{7}$/,         // 07X XXX XX XX
        /^[7][0-8]\d{7}$/,          // 7X XXX XX XX
        /^33\d{7}$/,                // 33 XXX XX XX (fixe)
        /^\+22133\d{7}$/,           // +221 33 XXX XX XX
    ];

    return patterns.some(pattern => pattern.test(cleaned));
}

function showFieldError(field, message) {
    field.classList.add('error');

    let errorEl = field.parentNode.querySelector('.form-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        field.parentNode.appendChild(errorEl);
    }

    errorEl.textContent = message;
    errorEl.classList.add('visible');
}

function clearFieldError(field) {
    field.classList.remove('error');

    const errorEl = field.parentNode.querySelector('.form-error');
    if (errorEl) {
        errorEl.classList.remove('visible');
    }
}

function validateForm(form) {
    const fields = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

/* ============================================
   Créneaux horaires
   ============================================ */
function generateTimeSlots() {
    const select = document.getElementById('heure_retrait');
    if (!select) return;

    const now = new Date();
    const slots = [];

    // Générer des créneaux pour aujourd'hui et demain
    for (let day = 0; day < 2; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() + day);

        const dayName = day === 0 ? "Aujourd'hui" : "Demain";
        const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        // Heures d'ouverture: 8h-22h (Lun-Sam), 9h-13h (Dim)
        const dayOfWeek = date.getDay();
        const startHour = dayOfWeek === 0 ? 9 : 8;
        const endHour = dayOfWeek === 0 ? 13 : 22;

        for (let hour = startHour; hour < endHour; hour++) {
            // Pour aujourd'hui, ne montrer que les créneaux futurs (+ 1h de préparation)
            if (day === 0 && hour <= now.getHours() + 1) continue;

            const timeSlot = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
            const value = `${date.toISOString().split('T')[0]}_${hour}`;

            slots.push({
                value: value,
                label: `${dayName} (${dateStr}) - ${timeSlot}`,
                group: dayName
            });
        }
    }

    // Grouper par jour
    let currentGroup = '';
    slots.forEach(slot => {
        if (slot.group !== currentGroup) {
            if (currentGroup) {
                select.innerHTML += '</optgroup>';
            }
            select.innerHTML += `<optgroup label="${slot.group}">`;
            currentGroup = slot.group;
        }
        select.innerHTML += `<option value="${slot.value}">${slot.label}</option>`;
    });

    if (slots.length === 0) {
        select.innerHTML = '<option value="">Aucun créneau disponible</option>';
    }
}

/* ============================================
   Soumission de la commande
   ============================================ */
async function submitOrder(form) {
    if (!validateForm(form)) {
        window.PharmacieApp.showToast('Veuillez corriger les erreurs du formulaire', 'error');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
        // Collecter les données
        const formData = new FormData(form);
        const orderData = {
            orderNumber: window.PharmacieApp.generateOrderNumber(),
            customer: {
                nom: formData.get('nom'),
                prenom: formData.get('prenom'),
                telephone: formData.get('telephone'),
                email: formData.get('email'),
                notes: formData.get('notes') || ''
            },
            pickupTime: formData.get('heure_retrait'),
            items: getOrderItems(),
            total: getOrderTotal(),
            createdAt: new Date().toISOString()
        };

        // Envoyer les emails via EmailJS
        const emailSent = await sendOrderEmails(orderData);

        if (emailSent) {
            // Sauvegarder la commande pour la page de confirmation
            sessionStorage.setItem('lastOrder', JSON.stringify(orderData));

            // Vider le panier
            window.PharmacieApp.clearCart();

            // Rediriger vers la confirmation
            window.location.href = 'confirmation.html';
        } else {
            throw new Error('Échec de l\'envoi des emails');
        }

    } catch (error) {
        console.error('Erreur lors de la commande:', error);
        window.PharmacieApp.showToast('Une erreur est survenue. Veuillez réessayer.', 'error');

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function getOrderItems() {
    const cart = window.PharmacieApp.getCart();
    return cart.map(item => {
        const product = window.PharmacieApp.getProductById(item.id);
        if (!product) return null;
        return {
            id: product.id,
            nom: product.nom,
            prix: product.prix,
            quantity: item.quantity,
            subtotal: product.prix * item.quantity
        };
    }).filter(item => item !== null);
}

function getOrderTotal() {
    const items = getOrderItems();
    return items.reduce((sum, item) => sum + item.subtotal, 0);
}

/* ============================================
   Envoi des emails
   ============================================ */
async function sendOrderEmails(orderData) {
    // Vérifier si EmailJS est configuré
    if (typeof emailjs === 'undefined' || !window.EmailConfig || !window.EmailConfig.isConfigured()) {
        console.warn('EmailJS non configuré - Simulation d\'envoi');
        // En mode développement, simuler un succès
        return true;
    }

    try {
        // Formater les articles pour l'email
        const itemsList = orderData.items.map(item =>
            `- ${item.nom} x${item.quantity} : ${window.PharmacieApp.formatPrice(item.subtotal)}`
        ).join('\n');

        // Formater le créneau de retrait
        const [date, hour] = orderData.pickupTime.split('_');
        const pickupDate = new Date(date);
        const pickupStr = `${pickupDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} entre ${hour}h et ${parseInt(hour) + 1}h`;

        // Données pour les templates
        const templateParams = {
            order_number: orderData.orderNumber,
            customer_name: `${orderData.customer.prenom} ${orderData.customer.nom}`,
            customer_email: orderData.customer.email,
            customer_phone: orderData.customer.telephone,
            customer_notes: orderData.customer.notes || 'Aucune note',
            items_list: itemsList,
            order_total: window.PharmacieApp.formatPrice(orderData.total),
            pickup_time: pickupStr,
            pharmacy_name: window.PharmacieApp.CONFIG.storeInfo.name,
            pharmacy_address: window.PharmacieApp.CONFIG.storeInfo.address,
            pharmacy_phone: window.PharmacieApp.CONFIG.storeInfo.phone
        };

        // Envoyer notification à la pharmacie
        await window.EmailConfig.sendPharmacyNotification(templateParams);

        // Envoyer confirmation au client
        await window.EmailConfig.sendClientConfirmation(templateParams);

        return true;

    } catch (error) {
        console.error('Erreur EmailJS:', error);
        return false;
    }
}

/* ============================================
   Page Confirmation
   ============================================ */
function displayConfirmation() {
    const orderData = sessionStorage.getItem('lastOrder');

    if (!orderData) {
        window.location.href = 'index.html';
        return;
    }

    const order = JSON.parse(orderData);

    // Numéro de commande
    const orderNumberEl = document.getElementById('order-number');
    if (orderNumberEl) {
        orderNumberEl.textContent = order.orderNumber;
    }

    // Email de confirmation
    const emailEl = document.getElementById('confirmation-email');
    if (emailEl) {
        emailEl.textContent = order.customer.email;
    }

    // Créneau de retrait
    const pickupEl = document.getElementById('pickup-time');
    if (pickupEl && order.pickupTime) {
        const [date, hour] = order.pickupTime.split('_');
        const pickupDate = new Date(date);
        pickupEl.textContent = `${pickupDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} entre ${hour}h et ${parseInt(hour) + 1}h`;
    }

    // Récapitulatif des articles
    const itemsContainer = document.getElementById('confirmation-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = order.items.map(item => `
            <div class="order-item">
                <span class="name">${window.PharmacieApp.escapeHtml(item.nom)}</span>
                <span class="qty">x${item.quantity}</span>
                <span class="price">${window.PharmacieApp.formatPrice(item.subtotal)}</span>
            </div>
        `).join('');
    }

    // Total
    const totalEl = document.getElementById('confirmation-total');
    if (totalEl) {
        totalEl.textContent = window.PharmacieApp.formatPrice(order.total);
    }

    // Nettoyer les données de session après affichage
    // sessionStorage.removeItem('lastOrder'); // Commenté pour permettre le rafraîchissement
}

/* ============================================
   Export global
   ============================================ */
window.OrderManager = {
    validateEmail,
    validateSenegalPhone,
    submitOrder
};
