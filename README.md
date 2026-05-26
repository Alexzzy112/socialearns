# SocialEarn - Social Media Task Earning Platform

A full-stack social media task earning platform built with Next.js, Express.js, MongoDB, and Paystack integration.

## Features

- User registration, login, and email/phone verification
- JWT-based secure authentication
- Social media tasks (Like, Comment, Follow, Share, YouTube subscribe, WhatsApp/Telegram join)
- Screenshot proof submission and admin verification
- Wallet system with deposit and withdrawal
- Referral system with N800 bonus
- Admin dashboard with user, task, withdrawal, and deposit management
- Real-time notifications
- AI fraud detection for task submissions
- Dark/Light mode
- PWA support
- Responsive mobile-first design

## Tech Stack

**Frontend:** Next.js 14, React 18, Tailwind CSS, Axios, Recharts  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Payment:** Paystack Integration  
**Storage:** Cloudinary for image uploads  
**Auth:** JWT (JSON Web Tokens)  
**Realtime:** Socket.io  

## Project Structure

```
Social/
├── backend/
│   ├── config/          # Database, Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, upload, rate limiting
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helpers, AI fraud detection
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static assets, PWA manifest
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # Shared components
│   │   ├── lib/         # API client, utilities
│   │   └── store/       # Auth & Theme contexts
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Cloudinary account
- Paystack account

### Backend Setup

```bash
cd backend
npm install
cp .env .env  # Edit with your values
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local .env.local  # Edit with your values
npm run dev
```

## Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/social-earn
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
SITE_URL=http://localhost:3000
ACTIVATION_FEE=1500
REFERRAL_BONUS=800
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_PAYSTACK_KEY=your_paystack_public_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send reset link
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/send-email-verification` - Send email OTP
- `POST /api/auth/verify-email` - Verify email OTP
- `POST /api/auth/send-phone-verification` - Send phone OTP
- `POST /api/auth/verify-phone` - Verify phone OTP

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard stats
- `PUT /api/users/password` - Update password

### Tasks
- `GET /api/tasks` - Get available tasks
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks/:id/submit` - Submit task proof
- `GET /api/tasks/submissions` - Get user submissions

### Wallet
- `GET /api/wallet` - Get wallet balance
- `GET /api/wallet/history` - Get transaction history

### Deposits
- `POST /api/deposits/initialize` - Initialize deposit
- `POST /api/deposits/verify` - Verify Paystack payment
- `GET /api/deposits` - Get user deposits

### Withdrawals
- `POST /api/withdrawals` - Request withdrawal
- `GET /api/withdrawals` - Get user withdrawals
- `GET /api/withdrawals/:id` - Get withdrawal details

### Referrals
- `GET /api/referrals` - Get referral info

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all read

### Leaderboard
- `GET /api/leaderboard` - Get top earners

### Admin (requires admin role)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/stats` - Platform statistics
- `GET/POST /api/admin/tasks` - Manage tasks
- `GET /api/admin/submissions` - Pending submissions
- `PUT /api/admin/submissions/:id/approve` - Approve submission
- `PUT /api/admin/submissions/:id/reject` - Reject submission
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/suspend` - Toggle suspension
- `PUT /api/admin/users/:id/activate` - Activate account
- `GET /api/admin/withdrawals` - List withdrawals
- `PUT /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `PUT /api/admin/withdrawals/:id/reverse` - Reverse withdrawal
- `PUT /api/admin/withdrawals/:id/delete` - Delete withdrawal
- `GET /api/admin/deposits` - List deposits
- `PUT /api/admin/deposits/:id/approve` - Approve deposit
- `PUT /api/admin/deposits/:id/reverse` - Reverse deposit
- `PUT /api/admin/deposits/:id/delete` - Delete deposit
- `POST /api/admin/announcements` - Send announcement

## Deployment

### Backend (Render / Railway / Heroku)

1. Push backend code to a Git repository
2. Set environment variables on the hosting platform
3. Ensure MongoDB Atlas connection string is configured
4. Deploy and start the server

### Frontend (Vercel)

1. Push frontend code to a Git repository
2. Import project on Vercel
3. Set environment variables
4. Deploy

## Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT token authentication
- Helmet.js security headers
- Rate limiting on API routes
- CORS configuration
- Input validation on all endpoints
- Admin role protection middleware
- AI-based fraud detection for submissions
- Suspicious activity monitoring

## License

MIT
