import React from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';

const WalletConnect: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <button 
        className="btn"
        style={{
          background: '#666666',
          color: '#ffffff',
          border: '1px solid #000000',
          padding: '8px 16px',
          cursor: 'not-allowed'
        }}
        disabled
      >
        Loading...
      </button>
    );
  }

  // If user is authenticated, show wallet info and disconnect button
  if (authenticated && user) {
    const wallet = wallets[0];
    const address = wallet?.address || user.wallet?.address;
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected';

    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" style={{ color: '#000000' }} />
          <span className="text-sm font-medium">{shortAddress}</span>
        </div>
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{
            background: '#ffffff',
            color: '#000000',
            border: '1px solid #000000',
            padding: '8px 16px',
            fontSize: '0.875rem'
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // If not authenticated, show connect button
  return (
    <button
      onClick={login}
      className="btn"
      style={{
        background: '#000000',
        color: '#ffffff',
        border: '1px solid #000000',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <Wallet className="h-5 w-5" style={{ color: '#ffffff' }} />
      Connect Wallet
    </button>
  );
};

export default WalletConnect;
