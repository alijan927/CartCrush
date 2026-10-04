# 🛒 CartCrush - Modern E-Commerce Platform & Admin Dashboard

![CartCrush Banner](https://img.shields.io/badge/CartCrush-E--Commerce-brightgreen?style=for-the-badge&logo=shopping-cart)
![Stack](https://img.shields.io/badge/Stack-MERN%20%7C%20HTML5%20%7C%20CSS3%20%7C%20JS-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

**CartCrush** is a feature-rich, fully responsive e-commerce web application designed to deliver a seamless shopping experience for users and a powerful management dashboard for store administrators. Built with clean architecture, custom CSS styling, and standard dynamic scripting.

---

## ✨ Features

### 🛍️ Front-End / Customer Storefront
* **Responsive Product Catalog:** Grid-based visual layout for viewing available products.
* **Category Filtering & Search:** Instant product filtering by categories and live search query matching.
* **Multi-Currency Display Switcher:** Real-time price conversion across currencies (**PKR, USD, AED, SAR, EUR, GBP**).
* **Interactive Shopping Cart:** Dynamic item management, quantity adjustments, and total bill calculations.
* **Checkout Flow:** Simple, user-friendly order placement interface.

### 🛡️ Admin Dashboard (`admin.html`)
* **Real-Time Analytics Cards:** At-a-glance overview of Total Revenue, Total Orders, and Product Inventory.
* **Product Management:** Add new inventory with multi-currency pricing input, categories, descriptions, and flexible image upload options (File upload or direct Web URL).
* **Inventory Control Table:** Filterable list of all products with edit/delete controls and live currency display toggle.
* **Order Tracking & Management:** Centralized view of all user orders, order items, customer details, timestamps, and order status controls.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** HTML5, Custom CSS3 (Flexbox & Grid), JavaScript (ES6+)
* **Styling:** Fully custom responsive architecture (`style.css`), cross-device compatible (Mobile, Tablet, Desktop)
* **Backend / API:** Node.js, Express.js (MERN Stack architecture)
* **Database:** MongoDB / JSON Local State Management

---

## 📁 Repository Structure

```text
CartCrush/
├── css/
│   └── style.css            # Centralized styles (Storefront & Admin responsive styling)
├── js/
│   ├── app.js               # Frontend shopping logic & currency converter
│   └── admin.js             # Admin dashboard operations & CRUD logic
├── index.html / home.html   # Main storefront UI
├── admin.html               # Admin control panel
└── README.md                # Project documentation