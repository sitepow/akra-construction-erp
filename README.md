<div align="center">

# 🏗️ Akra Construction ERP

**An enterprise resource planning platform engineered specifically for construction management, project tracking, resource allocation, and financial operations.**  
Built to streamline engineering workflows, budgeting, site operations, and administrative controls for modern construction enterprises.

[![Framework](https://img.shields.io/badge/Framework-Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![UI & Styling](https://img.shields.io/badge/UI-TailwindCSS%20%7C%20NextUI-blue?style=flat-square)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20Sequelize-orange?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-success?style=flat-square)](#)

[Overview](#-executive-summary) •
[Key Features](#-key-features) •
[Tech Stack](#-tech-stack-matrix) •
[Project Architecture](#-project-architecture) •
[Getting Started](#-getting-started)

---

</div>

## 📌 Executive Summary

**Akra Construction ERP** is a comprehensive enterprise application tailored to manage the complex lifecycle of construction projects. 

The platform bridges field operations and back-office administration by centralizing contractor management, cost estimations, resource allocation, milestone tracking, and real-time project reporting into a single unified web interface.

---

## ⚡ Key Features

- **Project & Site Tracking**: Monitor active construction sites, phases, milestones, and daily progress logs in real-time.
- **Resource & Material Management**: Track inventory, equipment deployment, and material requisition workflows across multiple project sites.
- **Financial & Budgeting Control**: Manage project costs, invoicing, expense tracking, and financial forecasting.
- **Role-Based Access Control (RBAC)**: Secure multi-level permissions for administrators, engineers, project managers, and financial staff.
- **Document & Report Generation**: Automated PDF generation for invoices, progress reports, and official engineering documentation.

---

## 🏛️ Tech Stack Matrix

| Layer / Domain | Technologies & Libraries | Role & Responsibility |
| :--- | :--- | :--- |
| **Frontend & Framework** | Next.js, React, Tailwind CSS, NextUI, Material UI | Responsive user interface, dashboards, and server-side rendering |
| **State Management** | Redux Toolkit, React Redux | Global application state management and data caching |
| **Backend & API** | Node.js, Express, Next-Connect | RESTful API endpoints and backend middleware services |
| **Database & ORM** | MySQL, Sequelize ORM, Redis | Relational data persistence, database modeling, and caching |
| **Security & Utilities** | JSON Web Tokens (JWT), Bcrypt, Multer | Secure authentication, password hashing, and file upload handling |

---

## 🗂️ Project Architecture

```text
akra-construction-erp/
├── components/          # Reusable UI components and widgets
├── database/            # Database models, migrations, and connections
├── middlewares/         # Authentication and request validation middlewares
├── pages/               # Next.js pages & API routes
├── public/              # Static assets (images, icons, fonts)
├── redux/               # Redux slices and store configuration
├── styles/              # Global stylesheets and Tailwind configurations
├── types/               # TypeScript interface definitions
└── utils/               # Helper functions and formatting utilities
