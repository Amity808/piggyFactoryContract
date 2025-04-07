import React, { useState } from 'react';
import WalletModal from './WalletModal';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';

const WalletConnect = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const switchToEduChain = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum-compatible wallet.');
      return;
    }

    const chainId = '0xA03BC'; // 656476 in hex

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xA03BC',
                chainName: 'EDU Chain Testnet',
                nativeCurrency: {
                  name: 'EDU',
                  symbol: 'EDU',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.open-campus-codex.gelato.digital'],
                blockExplorerUrls: ['https://edu-chain-testnet.blockscout.com'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add EDU Chain Testnet:', addError);
          alert('Failed to add EDU Chain Testnet. Please verify the network details.');
        }
      } else {
        console.error('Failed to switch to EDU Chain Testnet:', switchError);
        alert('Failed to switch to EDU Chain Testnet. Check your wallet connection.');
      }
    }
  };

  return (
    <div>
      <Button
        variant="default"
        size="sm"
        className="bg-[#0FA0CE] hover:bg-[#0FA0CE]/50"
        onClick={() => setIsWalletModalOpen(true)}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>

      <WalletModal
        open={isWalletModalOpen}
        onOpenChange={setIsWalletModalOpen}
        onConnect={switchToEduChain}
      />
    </div>
  );
};

export default WalletConnect;
