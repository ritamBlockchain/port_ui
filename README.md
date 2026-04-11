# PortChain UI Integration Guide

This frontend is configured to connect to your local Hyperledger Fabric network as specified in your Master Prompt.

## 🚀 Setup Instructions

### 1. Configure Environment
Update the following paths in `.env.local` to match your local Fabric organization structure:

```env
ADMIN_CERT_PATH=/path/to/your/org1/msp/signcerts/cert.pem
ADMIN_KEY_PATH=/path/to/your/org1/msp/keystore/priv_key
CONNECTION_PROFILE_PATH=/path/to/your/connection-org1.json
```

### 2. Install Native Dependencies
Since `fabric-network` has native components, ensures you have the necessary build tools:
- Node.js 18+
- Python 3.x
- C++ Build Tools (Xcode Command Line Tools on Mac)

### 3. Run Development Server
```bash
npm install
npm run dev
```

## 🧪 Testing All Roles
We have implemented a **Role Switcher** in the sidebar. 
1. Open the sidebar.
2. Select a role (e.g., Shipping Agent, Customs, Bank).
3. The UI will dynamically:
   - Filter menu items based on permissions.
   - Show/Hide action buttons (e.g., only Customs can Approve Pre-Arrivals).
   - Simulate identity-based dashboard data.

## 🏗️ Architecture
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (Maritime Theme)
- **Blockchain**: Hyperledger Fabric SDK v2.2
- **Audit**: Merkle Tree settlement visualization
- **Security**: RBAC with Private Data Collection indicators
