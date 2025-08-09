# Sui NFT Marketplace with zkLogin Authentication

A modern, secure decentralized NFT marketplace built on the Sui blockchain featuring zkLogin authentication via Google OAuth through Mysten Labs Enoki. This application enables users to mint, list, buy, and sell NFTs with enterprise-grade security and a seamless Web3 experience.

## � Live Demo

**[🚀 Try the Live Application](https://nftmarketplace-ten-phi.vercel.app/)**

Experience the marketplace in action! The live demo is deployed on Vercel and connected to Sui testnet, allowing you to:
- Authenticate with Google via zkLogin
- Mint your own NFTs with custom metadata
- Browse and purchase NFTs from other users
- Experience the full marketplace functionality

*Note: This is a testnet deployment for demonstration purposes. All transactions use test SUI tokens. Kindly copy your respective wallet address with the readily available button on our website and request for SUI tokens from https://faucet.sui.io/ before proceeding further*

## �🌟 Features

### Core Marketplace Features
- **🎨 NFT Minting**: Create unique digital assets with custom metadata
- **🛒 Buy & Sell**: Trade NFTs with integrated payment processing
- **📋 Listing Management**: List and manage your NFT inventory
- **💰 Fee Management**: Configurable marketplace fees (2.5% default)
- **🔍 Real-time Updates**: Live marketplace data and transaction status

### Authentication & Security
- **🔐 zkLogin Integration**: Passwordless authentication using Google OAuth
- **⏰ Session Management**: Configurable session timeouts (2-24 hours)
- **🛡️ Security Profiles**: High, Medium, and Low security configurations
- **🚫 No Auto-Connect**: Secure-by-default authentication flow
- **📱 Activity Tracking**: Automatic session extension based on user activity

### User Experience
- **🎭 Animated UI**: Beautiful glassmorphism design with smooth animations
- **📱 Responsive Design**: Mobile-first responsive interface
- **🌙 Dark Theme**: Modern dark theme with gradient accents
- **⚡ Real-time Feedback**: Instant transaction status and error handling

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling with custom glassmorphism components
- **Lucide React** for icons
- **React Query** for data fetching and caching

### Blockchain Integration
- **Sui Blockchain** (Testnet to allow for demonstration)
- **@mysten/dapp-kit** for Sui integration
- **@mysten/enoki** for zkLogin authentication
- **Move Language** smart contracts

### Smart Contracts
- **NFT Module**: Handles NFT creation and metadata management
- **Marketplace Module**: Manages listings, purchases, and fees
- **Admin System**: Administrative controls and fee management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Sui CLI installed

### Environment Setup for Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd Alt-F4-NFTMarketplace
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file:
```env
VITE_ENOKI_API_KEY=your_enoki_api_key_here
```

4. **Start development server**
```bash
npm run dev
```

### Smart Contract Deployment

1. **Navigate to contracts directory**
```bash
cd contracts
```

2. **Build contracts**
```bash
sui move build
```

3. **Deploy to testnet**
```bash
sui client publish --gas-budget 20000000
```

4. **Update configuration**
Update `src/config/constants.ts` with deployed package and object IDs.

## 📁 Project Structure

```
├── src/                          # Frontend application
│   ├── components/               # React components
│   │   ├── BackgroundAnimation.tsx
│   │   ├── CreateNFTModal.tsx
│   │   ├── ListNFTModal.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MarketplaceDashboard.tsx
│   │   ├── RegisterEnokiWallets.tsx
│   │   └── SessionTimeout.tsx
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx       # Authentication state management
│   │   └── MarketplaceContext.tsx # Marketplace data management
│   ├── services/                 # Business logic
│   │   └── marketplaceService.ts # Sui blockchain integration
│   ├── config/                   # Configuration files
│   │   ├── constants.ts          # Blockchain constants
│   │   ├── security.ts           # Security profile management
│   │   └── session.ts            # Session configuration
│   └── types/                    # TypeScript type definitions
├── contracts/                    # Move smart contracts
│   ├── sources/
│   │   ├── marketplace.move      # Marketplace logic
│   │   └── nft.move             # NFT implementation
│   └── tests/                    # Move test files
├── tests/                        # Additional test files
└── public/                       # Static assets
```

## 🔧 Configuration

### Security Profiles

The application supports three security configurations:

```typescript
import { applySecurityProfile } from './src/config/security';

// High Security (2 hours)
applySecurityProfile('HIGH');

// Medium Security (8 hours)  
applySecurityProfile('MEDIUM');

// Low Security (24 hours - Default)
applySecurityProfile('LOW');
```

### Marketplace Configuration

Edit `src/config/constants.ts`:

```typescript
export const MARKETPLACE_CONFIG = {
  PACKAGE_ID: "your_package_id",
  MARKETPLACE_ID: "your_marketplace_id", 
  ADMIN_CAP_ID: "your_admin_cap_id",
  NETWORK: "testnet"
};
```

### Session Management

Customize session behavior in `src/config/session.ts`:

```typescript
export const SESSION_CONFIG = {
  TIMEOUT: 24 * 60 * 60 * 1000,        // 24 hours
  WARNING_TIME: 5 * 60 * 1000,          // 5 minutes warning
  ACTIVITY_EVENTS: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'],
};
```

## 🔐 Security Features

### Authentication Flow
1. **Secure Login**: Users authenticate via Google OAuth through Enoki
2. **Session Management**: 24-hour sessions with configurable timeouts
3. **Activity Tracking**: Sessions extend automatically with user activity
4. **No Auto-Connect**: Requires explicit authentication on each browser session

### Session Security
- **Automatic Expiry**: Sessions expire after configured timeout
- **Warning System**: Users receive warnings before session expiry
- **Clean Logout**: Complete session cleanup on logout
- **Browser Restart Protection**: No automatic reconnection after browser restart

## 🧪 Testing

### Run Move Tests
```bash
cd contracts
sui move test
```

### Frontend Testing
```bash
npm run lint
```

## 📦 Building for Production

```bash
npm run build
```

The built application will be in the `dist/` directory, ready for deployment.

## 🚀 Deployment

### Vercel Deployment
The project includes Vercel configuration (`vercel.json`) with:
- CORS headers for Sui integration
- SPA routing support
- Production optimizations

### Environment Variables for Production
```env
VITE_ENOKI_API_KEY=production_enoki_api_key
```

## 🛠️ Development Tools

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🎨 Design System

### Glassmorphism Theme
- Dark background with glass-effect panels
- Gradient color schemes (blue, purple, pink)
- Smooth animations and transitions
- Mobile-responsive design

### Color Palette
- Primary: Blue gradients (#3B82F6 to #1E40AF)
- Secondary: Purple gradients (#8B5CF6 to #5B21B6)
- Accent: Pink gradients (#EC4899 to #BE185D)
- Background: Black (#000000)
- Glass effects with white opacity overlays

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Mysten Labs** for Sui blockchain and Enoki authentication
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for beautiful icons
- **React** team for the excellent framework

## 📞 Support

For support and questions:
- Open an issue in the GitHub repository
- Check the [Sui documentation](https://docs.sui.io/)
- Review [Enoki documentation](https://docs.enoki.mystenlabs.com/)

---

**Built with ❤️ on Sui blockchain**