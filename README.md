# CrewVar Frontend

A professional React application for cruise ship crew members to connect, chat, and manage their professional networks.

## 🚀 Features

- **Authentication**: Firebase Authentication with email/password and Google OAuth
- **Real-time Chat**: Firebase Realtime Database for instant messaging
- **User Profiles**: Comprehensive crew member profiles with ship assignments
- **Connections**: Network with other crew members across different ships
- **Notifications**: Real-time notifications for connections and messages
- **Admin Panel**: Comprehensive admin dashboard for user management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Professional error boundaries and validation
- **Performance**: Optimized with React Query and lazy loading

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Firebase** - Backend-as-a-Service (Auth, Firestore, Storage, Functions)
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation
- **Yup** - Schema validation
- **React Toastify** - Toast notifications
- **React Icons** - Icon library

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── context/            # React Context providers
│   ├── AuthContextFirebase.tsx
│   └── RealtimeContextFirebase.tsx
├── features/           # Feature-based organization
│   ├── auth/           # Authentication features
│   ├── chat/           # Chat functionality
│   ├── connections/     # User connections
│   └── ...
├── firebase/           # Firebase configuration and services
│   ├── config.ts
│   ├── auth.ts
│   ├── firestore.ts
│   └── ...
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Route definitions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
└── assets/             # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crewvar/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Firebase configuration in `.env.local`:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Build and Deployment

### Production Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment

The application is configured for deployment on:

- **Vercel** (recommended)
- **Netlify**
- **Firebase Hosting**

## 🔐 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication, Firestore, Storage, and Functions

### 2. Configure Authentication

1. Go to Authentication > Sign-in method
2. Enable Email/Password and Google providers
3. Configure authorized domains

### 3. Configure Firestore

1. Go to Firestore Database
2. Create database in production mode
3. Set up security rules
4. Create required indexes

### 4. Configure Storage

1. Go to Storage
2. Set up Cloud Storage
3. Configure security rules

## 📱 Mobile App Support

CrewVar is fully configured for mobile app deployment using Capacitor:

### Mobile Platforms

- **Android** - Native Android app support
- **iOS** - Native iOS app support (requires macOS)
- **PWA** - Progressive Web App support

### Mobile Features

- **Push Notifications** - Real-time notifications
- **Camera Integration** - Photo capture and gallery access
- **File System Access** - Local file management
- **Device Information** - Platform detection and optimization
- **Network Status** - Offline/online detection
- **Status Bar Control** - Native status bar styling
- **Keyboard Handling** - Mobile keyboard optimization

### Mobile Development

#### Prerequisites

- **Android**: Android Studio, Java JDK 17+
- **iOS**: macOS, Xcode, Apple Developer Account
- **General**: Node.js 18+, npm

#### Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your Firebase config

# Build web app
npm run build

# Add mobile platforms
npm run cap:add:android
npm run cap:add:ios

# Sync Capacitor
npm run cap:sync

# Open in IDEs
npm run cap:open:android  # Android Studio
npm run cap:open:ios      # Xcode
```

#### Available Scripts

- `npm run cap:sync` - Sync web app to mobile platforms
- `npm run cap:open:android` - Open Android Studio
- `npm run cap:open:ios` - Open Xcode
- `npm run cap:build:android` - Build and open Android
- `npm run cap:build:ios` - Build and open iOS
- `npm run cap:run:android` - Run on Android device
- `npm run cap:run:ios` - Run on iOS device

### App Store Deployment

#### Android (Google Play Store)

1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Complete store listing with screenshots
4. Submit for review

#### iOS (Apple App Store)

1. Archive app in Xcode
2. Upload to App Store Connect
3. Complete store listing with screenshots
4. Submit for review

### Mobile Testing

- **Android**: Use Android Studio emulator or physical device
- **iOS**: Use Xcode simulator or physical device
- **PWA**: Test in mobile browsers

For detailed mobile setup instructions, see [Mobile Setup Guide](docs/mobile-setup-guide.md).

## 📱 Features Overview

### Authentication

- Email/password registration and login
- Google OAuth integration
- Email verification
- Password reset functionality
- Protected routes and guards

### User Management

- Comprehensive user profiles
- Ship assignments and department roles
- Profile photo uploads
- Social media links
- Privacy settings

### Real-time Chat

- Instant messaging between crew members
- File and image sharing
- Message status indicators
- Chat room management
- Message history

### Connections

- Send and receive connection requests
- Accept/reject connections
- View connection status
- Block/unblock users
- Connection management

### Notifications

- Real-time notifications
- Email notifications
- Push notifications (future)
- Notification preferences
- Admin notifications

### Admin Panel

- User management
- Content moderation
- Analytics dashboard
- Support ticket system
- System configuration

## 🎨 Design System

### Colors

- Primary: `#069B93` (Teal)
- Secondary: `#058a7a` (Dark Teal)
- Accent: `#047a6a` (Darker Teal)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)

### Typography

- Headings: Inter font family
- Body: System font stack
- Code: JetBrains Mono

### Spacing

- Consistent spacing scale using Tailwind CSS
- Mobile-first responsive design
- Accessible color contrast ratios

## 🔒 Security

- Firebase Authentication for user management
- Firestore security rules for data access
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure file uploads

## 📊 Performance

- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies
- Offline support (PWA ready)

## 🧪 Testing

- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Cypress
- Type checking with TypeScript

## 📈 Analytics

- Firebase Analytics integration
- User behavior tracking
- Performance monitoring
- Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@crewvar.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added admin panel and moderation
- **v1.2.0** - Enhanced chat features and file sharing
- **v1.3.0** - Performance optimizations and PWA support

---

Built with ❤️ for the cruise ship community
#   c r e w c r e x  
 