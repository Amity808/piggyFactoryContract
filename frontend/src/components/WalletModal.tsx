import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useConnectors, useAccount } from 'wagmi';
import { toast } from 'sonner';

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => Promise<void>; // Function to switch network after connection
}

const WalletModal = ({ open, onOpenChange, onConnect }: WalletModalProps) => {
  const [pendingConnectorUID, setPendingConnectorUID] = useState(null);
  const connectors = useConnectors();
  const { address } = useAccount();

  const otherConnectors = connectors.filter(
    (connector) => connector.id !== 'walletConnect'
  );

  // Handle wallet selection and connection
  const handleConnectWallet = async (connector: any) => {
    try {
      setPendingConnectorUID(connector?.id);
      await connector.connect(); // Connect the wallet
      await onConnect(); // Switch to EDU Chain after connection
      toast.success('Connected to EDU Chain Testnet');
      onOpenChange(false); // Close the modal on success
    } catch (error) {
      if (error instanceof Error && error.name === 'UserRejectedRequestError') {
        toast.error('User rejected the connection request');
      } else {
        console.error('Wallet connection error:', error);
        toast.error('Failed to connect wallet or switch network');
      }
      onOpenChange(false);
    } finally {
      setPendingConnectorUID(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your preferred wallet to access staking features on EDU Chain Testnet
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {otherConnectors.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="flex justify-between items-center p-4 h-auto"
              disabled={pendingConnectorUID === wallet.uid}
              onClick={() => handleConnectWallet(wallet)}
            >
              <div className="flex items-center gap-3">
                {pendingConnectorUID === wallet.uid && (
                  <div className="text-2xl">{wallet.icon}</div>
                )}
                <span>{wallet.name}</span>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-2 flex flex-col space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Your wallet data is securely handled</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Verify network details before proceeding</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;