# Lostify – Lost & Found Platform for University

Lostify is a **web application for university students** that helps users report, search, and match lost & found items easily.  
It integrates **Next.js (React)** on the frontend, **Supabase** as backend and **PostgreSQL** as the database.

---

## Features

### User Authentication & Account Management
- Email and password–based user registration
- Secure user login and logout
- Password reset via email verification
- Email verification during account registration

### Lost & Found Item Reporting
- Report lost or found items with a title, category, location, date, and description
- Upload item images when creating lost or found reports

### Item Search & Filtering
- Keyword based search for lost and found items
- Filter items by:
  - Category
  - Location
  - Type (Lost / Found)
  - Date

### Item Details View
- View complete item information including:
  - Item image
  - Description
  - Date reported
  - Location
  - Contact information of the owner or finder

### In-App Communication
- In app chat system to contact item owners or finders
- Real-time in-app notifications for new chat messages

### Item Management
- Delete previously reported items only by the owner
- Mark items as resolved once they are found or recovered

### Smart Matching
- Automatic detection of potential matches between lost and found items based on:
  - Category
  - Title
  - Date
  - Location

### Notifications
- In-app notifications for:
  - Item match alerts
  - Chat messages
- Email notifications for:
  - Item match alerts
  - Account verification
  - Password reset requests
---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js (React), TypeScript, Tailwind CSS, Radix UI |
| Backend | Supabase |
| Database | PostgreSQL (Supabase Managed) |
| Image Storage | Supabase Storage |
| Email Service | Gmail OAuth |
| Testing | Jest |
| Hosting | Vercel |
| Version Control | GitLab |
| Project Management | Jira (Agile Scrum) |


---

## Prerequisites

- Node.js ≥ 18  
- npm 
- Supabase account  
- Git
