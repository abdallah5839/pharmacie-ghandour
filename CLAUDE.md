# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pharmacie Ghandour is a static e-commerce website for a pharmacy in Dakar, Senegal. Customers can browse products, add items to cart, and place orders for in-store pickup (no delivery, no online payment). The site uses vanilla HTML/CSS/JavaScript with no build tools or frameworks.

## Running the Project

Open `index.html` directly in a browser, or use a local server:
```bash
npx serve .
# or
python -m http.server 8000
```

The site can be deployed to Netlify or Vercel using the included config files (`netlify.toml`, `vercel.json`).

## Architecture

### Page Structure
- `index.html` - Homepage with product carousels
- `categorie.html` - Category/search results with filters
- `produit.html` - Individual product page
- `panier.html` - Shopping cart
- `commande.html` - Order form (guest checkout)
- `confirmation.html` - Order confirmation
- `contact.html` - Contact form with pharmacy info

### JavaScript Modules

All JS files use the global `window.PharmacieApp` object for shared utilities:

| File | Purpose |
|------|---------|
| `js/main.js` | Core utilities, navigation, search, cart storage (localStorage). Exposes `PharmacieApp` global with `formatPrice()`, `getCart()`, `saveCart()`, `showToast()`, etc. |
| `js/products.js` | Product filtering, sorting, pagination. Handles `categorie.html` and `produit.html` pages. |
| `js/cart.js` | Cart page display, quantity management. Exports `CartManager`. |
| `js/order.js` | Order form validation, submission, confirmation page. Exports `OrderManager`. |
| `js/email.js` | EmailJS configuration for sending order notifications. Exports `EmailConfig`. |
| `js/carousel.js` | Homepage product carousels and category dropdown menu. |
| `js/sanity.js` | Sanity CMS client - fetches data from Sanity API with fallback to local JSON. Exposes `SanityClient` global. |

### CSS Structure
- `css/style.css` - Global styles, CSS variables, header, footer, typography
- `css/components.css` - Reusable components (buttons, cards, forms, badges)
- `css/responsive.css` - Mobile breakpoints and responsive adjustments

### Data
- `data/products.json` - Fallback product data (static JSON)
- Sanity CMS - Primary data source for products, categories, and orders

### Sanity CMS Integration
- **Project ID**: `ir1xi4z1`
- **Dataset**: `production`
- **Studio**: `sanity-studio/` folder (run with `npm run dev`)
- Data is fetched from Sanity API, with automatic fallback to `data/products.json` if Sanity is unavailable
- Orders are saved to Sanity CMS for tracking in the admin dashboard

## Key Conventions

### Currency
All prices are in FCFA (West African CFA franc). Use `PharmacieApp.formatPrice(price)` for display.

### Phone Validation
Senegalese phone formats: `+221 7X XXX XX XX`, `7X XXX XX XX`, `33 XXX XX XX` (landline). Validation in `js/order.js:validateSenegalPhone()`.

### Cart Persistence
Cart stored in localStorage under key `pharmacie_cart` as array of `{id, quantity}` objects. Products are resolved from `products.json` at display time.

### Event System
Products are loaded asynchronously. Listen for `productsLoaded` custom event before accessing product data:
```javascript
document.addEventListener('productsLoaded', function() {
    // Safe to use PharmacieApp.getProducts() here
});
```

### Code Comments
All code comments are in French per project requirements.

## EmailJS Setup

Email sending is optional during development (simulated). To enable real emails:
1. Create account at emailjs.com
2. Add email service and create templates
3. Update credentials in `js/email.js` (PUBLIC_KEY, SERVICE_ID, template IDs)

Template variables: `order_number`, `customer_name`, `customer_email`, `customer_phone`, `items_list`, `order_total`, `pickup_time`, `pharmacy_name`, `pharmacy_address`, `pharmacy_phone`

## CSS Variables

Primary colors defined in `:root`:
- `--primary-green: #2E7D32`
- `--primary-green-light: #4CAF50`
- `--primary-green-dark: #1B5E20`
- `--accent: #81C784`

## Business Rules

- **No delivery** - Orders are pickup only at the pharmacy
- **No online payment** - Payment is made in person at pickup
- **Guest checkout only** - No user accounts (may be added later)
- **Prescription products** - Marked with `prescriptionRequise: true` in product data, displayed with "Ordonnance" badge
