/* ============================================
   PHARMACIE GHANDOUR - Configuration EmailJS
   ============================================ */

/*
 * CONFIGURATION EMAILJS
 *
 * Pour activer l'envoi d'emails, suivez ces étapes :
 *
 * 1. Créez un compte gratuit sur https://www.emailjs.com/
 *
 * 2. Ajoutez un service email (Gmail, Outlook, etc.)
 *    - Allez dans "Email Services" > "Add New Service"
 *    - Connectez votre compte email
 *    - Notez le SERVICE_ID
 *
 * 3. Créez les templates email :
 *
 *    Template 1: Notification Pharmacie (TEMPLATE_PHARMACY)
 *    -------------------------------------------------------
 *    Sujet: Nouvelle commande #{{order_number}}
 *
 *    Corps:
 *    Nouvelle commande reçue !
 *
 *    Numéro: {{order_number}}
 *    Client: {{customer_name}}
 *    Téléphone: {{customer_phone}}
 *    Email: {{customer_email}}
 *
 *    Articles commandés:
 *    {{items_list}}
 *
 *    Total: {{order_total}}
 *
 *    Créneau de retrait: {{pickup_time}}
 *
 *    Notes du client: {{customer_notes}}
 *
 *
 *    Template 2: Confirmation Client (TEMPLATE_CLIENT)
 *    --------------------------------------------------
 *    Sujet: Confirmation de votre commande #{{order_number}} - {{pharmacy_name}}
 *
 *    Corps:
 *    Bonjour {{customer_name}},
 *
 *    Votre commande a bien été enregistrée !
 *
 *    Numéro de commande: {{order_number}}
 *
 *    Récapitulatif:
 *    {{items_list}}
 *
 *    Total: {{order_total}}
 *
 *    Retrait prévu: {{pickup_time}}
 *
 *    Adresse de retrait:
 *    {{pharmacy_name}}
 *    {{pharmacy_address}}
 *    {{pharmacy_phone}}
 *
 *    Merci de votre confiance !
 *    L'équipe {{pharmacy_name}}
 *
 * 4. Récupérez votre clé publique :
 *    - Allez dans "Account" > "API Keys"
 *    - Copiez la "Public Key"
 *
 * 5. Remplacez les valeurs ci-dessous par vos identifiants
 */

const EmailJSConfig = {
    // À REMPLACER par vos propres identifiants EmailJS
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY',
    SERVICE_ID: 'YOUR_SERVICE_ID',
    TEMPLATE_PHARMACY: 'template_pharmacy_notification',
    TEMPLATE_CLIENT: 'template_client_confirmation'
};

// Vérifier si EmailJS est configuré
function isEmailJSConfigured() {
    return EmailJSConfig.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
           EmailJSConfig.SERVICE_ID !== 'YOUR_SERVICE_ID';
}

// Initialisation d'EmailJS
function initEmailJS() {
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS SDK non chargé. Ajoutez le script EmailJS dans votre HTML.');
        return false;
    }

    if (!isEmailJSConfigured()) {
        console.warn('EmailJS non configuré. Voir les instructions dans email.js');
        return false;
    }

    try {
        emailjs.init(EmailJSConfig.PUBLIC_KEY);
        console.log('EmailJS initialisé avec succès');
        return true;
    } catch (error) {
        console.error('Erreur initialisation EmailJS:', error);
        return false;
    }
}

// Envoyer notification à la pharmacie
async function sendPharmacyNotification(templateParams) {
    if (!isEmailJSConfigured()) {
        console.log('Mode dev: Notification pharmacie simulée', templateParams);
        return Promise.resolve({ status: 200, text: 'Simulation OK' });
    }

    return emailjs.send(
        EmailJSConfig.SERVICE_ID,
        EmailJSConfig.TEMPLATE_PHARMACY,
        templateParams
    );
}

// Envoyer confirmation au client
async function sendClientConfirmation(templateParams) {
    if (!isEmailJSConfigured()) {
        console.log('Mode dev: Confirmation client simulée', templateParams);
        return Promise.resolve({ status: 200, text: 'Simulation OK' });
    }

    return emailjs.send(
        EmailJSConfig.SERVICE_ID,
        EmailJSConfig.TEMPLATE_CLIENT,
        templateParams
    );
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    initEmailJS();
});

// Export global
window.EmailConfig = {
    init: initEmailJS,
    isConfigured: isEmailJSConfigured,
    sendPharmacyNotification,
    sendClientConfirmation,
    config: EmailJSConfig
};
