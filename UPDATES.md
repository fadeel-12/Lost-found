# Lostify – Feature Updates

A full record of features and improvements added to the Lostify lost & found platform.

---

## New Features

### Pet QR Tags
- Dedicated pet profile pages with owner contact information
- QR code generation for pets that links to the pet profile
- Dashboard for managing pet QR tags
- Expiry system for QR tag validity tracking
- GPS location capture when a QR tag is scanned, automatically recording where the pet was found

### Progressive Web App (PWA)
- Service worker for offline support and background sync
- Web app manifest for home-screen installation on mobile devices
- In-app install banner prompting users to add Lostify to their home screen
- Full PWA compliance (icons, theme color, display mode)

### Profile Photo Upload
- Profile photo upload during account registration
- Profile photo change from the Edit Profile dialog
- Improved avatar picker UI with visual selection and preview

### Mobile & Tablet Responsiveness
- Fully responsive layout for all pages and dialogs
- Optimized navigation, item cards, and forms for small screens
- Touch-friendly interactions throughout the app

### Potential Matches in Item Details
- "Potential Matches" section shown directly inside the item details dialog
- Matches are ranked by category, title, date, and location similarity

---

## Core Features (shipped earlier)

### User Authentication & Account Management
- Email and password registration with email verification
- Secure login, logout, and session management via database sessions
- Password reset via email

### Lost & Found Item Reporting
- Report lost or found items with title, category, location, date, description, and image
- Items are linked to the reporting user's account

### Item Search & Filtering
- Keyword search across all items
- Filter by category, location, type (Lost / Found), and date
- Paginated item listings

### Item Details View
- Full item info: image, description, date, location, and contact info
- Potential matches surfaced automatically below item details

### In-App Chat
- Real-time chat between item owners and finders
- Unread message count and read receipts
- Chat list accessible from the header

### Notifications
- Real-time in-app notifications for new messages and matches
- Mark individual notifications or all notifications as read
- Notifications panel accessible from the header

### Profile Management
- Profile dropdown in the header showing the logged-in user
- Edit profile dialog (display name, contact info, avatar)
- "My Items" dialog listing all items reported by the user
- Delete reported items (owner only)
- Mark items as recovered/resolved

### Smart Matching
- Automatic matching of lost and found items based on category, title, location, and date
- Matches are shown in the item details view

---

## Quality & Infrastructure

### CI/CD Pipeline
- GitLab CI/CD pipeline running on all branch pushes and merge requests
- Automated linting (ESLint) and test checks before merge
- Vercel deployment integrated into the CI/CD pipeline

### Unit Testing
- Jest and Testing Library configured for the Next.js project
- Unit tests for key UI components
- Tests enforced in CI

### Vercel Deployment
- Production deployment hosted on Vercel
- Environment variables and build config set up for Vercel
