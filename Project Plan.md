# Project Plan: AI-Powered E-commerce Personalization & Analytics Platform
Author: Zejun Li
Date: August 2025

## 1. Executive Summary
This project is a full-stack, enterprise-grade web application designed to provide advanced data analytics and AI-driven personalization for e-commerce businesses using the Shopify platform. The system extracts raw sales and customer data, processes it through a robust data pipeline, and presents it in two ways:
1. An intuitive Tableau analytics dashboard for business owners to discover actionable insights and track key performance indicators (KPIs).
2. A real-time personalization engine that integrates with the live Shopify store to deliver custom product recommendations, boosting customer engagement and sales.

This project demonstrates a comprehensive skill set spanning data engineering, business intelligence, full-stack web development, and modern DevOps practices, making it a powerful showcase for both Data Analyst and Web Developer roles.
## 2. System Architecture Diagram
This diagram illustrates the flow of data and the interaction between the different components of the platform.

- Data Flow: Shopify -> Python ETL Script -> PostgreSQL Database (Supabase) -> Tableau / Node.js REST API
- Application Flow:
    - Admin User: Browser -> React/Angular Admin Panel -> Node.js API -> PostgreSQL
    - Store Shopper: Shopify Storefront -> JavaScript Widget -> Node.js API -> PostgreSQL

## 3. Component & Technology Breakdown
Component 1: Data Pipeline & Analytics Core
- Objective: To build the foundational data infrastructure for extracting, storing, and analyzing e-commerce data.
- Technologies:
    - Python: Used for the Extract, Transform, Load (ETL) process. A script will connect to the Shopify API, fetch raw JSON data (orders, customers, products), clean and structure it, and load it into the data warehouse.
    - SQL (PostgreSQL, Supabase): Serves as the relational data warehouse. Complex SQL queries will be used to create aggregated tables and views for efficient analysis (e.g., customer lifetime value, cohort analysis, product affinity).
    - Tableau: The primary business intelligence and data visualization tool. Tableau will connect directly to the PostgreSQL database to create interactive dashboards that visualize sales trends, customer segmentation, and inventory metrics.
    - Excel: The platform will provide functionality to export cleaned, aggregated data from the dashboards into Excel for ad-hoc analysis by business users.
  
Component 2: Backend Services
- Objective: To create a secure and scalable API layer that serves data to the frontend applications.
- Technologies:
    - Node.js (Express.js): Powers the main REST API. This API acts as the central hub, handling requests from the frontend applications, querying the PostgreSQL database, and returning data in JSON format.
    - PHP: A separate microservice will be built in PHP to demonstrate polyglot architecture. Its function will be to integrate with a third-party CMS solution (e.g., a WordPress blog via its API) to fetch related content (like blog posts about a product) that can be displayed on the storefront.
    - TypeScript: The Node.js API will be written in TypeScript to ensure type safety, better code maintainability, and easier collaboration, which are crucial in enterprise-level applications.

Component 3: Frontend Web Applications
- Objective: To build two distinct, user-friendly interfaces: one for the business owner and one for the end customer.
- Technologies:
    - React & TypeScript: The primary framework for building the secure Admin Analytics Dashboard. This single-page application will allow users to view analytics, manage settings, and monitor the platform.
    - Tailwind CSS: Used for styling the entire React dashboard, demonstrating proficiency in modern, utility-first CSS for creating clean, responsive designs.
    - Angular: A specific, feature-rich module within the React application (e.g., a "Customer Segment Builder") will be built with Angular. This showcases the ability to work with multiple frontend frameworks and hints at an advanced micro-frontend architecture.
    - JavaScript, HTML, CSS (Bootstrap): A lightweight personalization widget will be built using vanilla JavaScript. This widget will be embedded in the Shopify store's theme. It will be styled with Bootstrap to demonstrate versatility with different CSS frameworks.
  
Component 4: Deployment & Operations
- Objective: To implement a modern, automated workflow for deploying and maintaining the application.
Technologies:
    - Vercel: The chosen platform for hosting the frontend applications (React/Angular) and the serverless Node.js API. Vercel is ideal for its seamless Git integration and automated deployment pipelines.
    - CI/CD Pipelines (GitHub Actions): A continuous integration and deployment pipeline will be set up. When code is pushed to the main branch on GitHub, automated actions will trigger to run tests, build the applications, and deploy the new versions to Vercel without manual intervention.
## 4. Business Value & Key Features
- For the Business Owner:
  - 360-Degree Customer View: Aggregates all customer data into one place.
  - Actionable Insights: Tableau dashboards reveal which products are selling, who is buying them, and when.
  - Data-Driven Decisions: Enables inventory management, marketing campaign planning, and sales strategy based on real data.
- For the E-commerce Customer:
  - Personalized Shopping: The storefront widget will show "Recommended for You" sections based on the user's browsing and purchase history.
  - Enhanced Discovery: Helps users find products they are more likely to be interested in, improving the overall shopping experience.
- Overall Business Impact: Increased customer retention, higher average order value, and a significant competitive advantage through data utilization.
