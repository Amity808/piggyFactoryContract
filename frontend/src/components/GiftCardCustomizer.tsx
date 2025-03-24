import React, { useState } from 'react';
import { Check, ChevronDown, CreditCard, Gift, Palette, User } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';
import { toast } from "@/components/ui/use-toast";
import { useAccount, useWriteContract, useSimulateContract, useReadContract } from 'wagmi';
import { USDC, Factory } from '@/constant';
import FactoryAbi from "@/contract/Factory.json";
import { ethers } from 'ethers';
import { tokenAbi } from '@/contract/token';
import useDeployNewGift from '@/hooks/useDeployNewGift';
import {  ErrorDecoder } from 'ethers-decode-error'
import type { DecodedError } from 'ethers-decode-error'
// import SendGiftMail from '@/email/Welcome';


const errorDecoder = ErrorDecoder.create()



interface GiftCardCustomizerProps {
  onUpdate: (data: {
    recipient: string;
    amount: number;
    currency: string;
    message: string;
    mailAddress: string;
    theme: 'blue' | 'purple' | 'green' | 'gold';
  }) => void;
}

const GiftCardCustomizer = ({ onUpdate }: GiftCardCustomizerProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState('ETH');
  const [message, setMessage] = useState('');
  const [mailAddress, setMailAddress] = useState('')
  const [theme, setTheme] = useState<'blue' | 'purple' | 'green' | 'gold'>('blue');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const { address } = useAccount();

  const { data: userCreatedAddres } = useReadContract({
    abi: FactoryAbi,
    address: Factory,
    functionName: "GiftCardDeploy",
    args: [address],

  })

  const { data: userReadAllowance } = useReadContract({
    abi: tokenAbi,
    address: USDC,
    functionName: "allowance",
    args: [address, userCreatedAddres],

  })

  const { handleCreateContract } = useDeployNewGift({
    userContractAddress: userCreatedAddres as `0x${string}`,
    recipient, amount, tokenAddress: USDC, mail: 'mailAddress'
  })
  const { writeContractAsync } = useWriteContract()

  // const { data: simulateGift, error } = useSimulateContract({
  //   abi: GiftAbi,
  //   address: userCreatedAddres as `0x${string}`,
  //   functionName: "createGiftcard",
  //   args: [recipient as `0x${string}`, ethers.parseEther(amount.toString()), USDC, 'mailAddress'],
  // })

  const { data: simulateApproval, error: errorApproval } = useSimulateContract({
    abi: tokenAbi,
    address: USDC,
    functionName: 'approve',
    args: [userCreatedAddres, ethers.parseEther(amount.toString())],
  })
  console.log(errorApproval)

  const currencies = [
    { id: 'BTC', name: 'EDU', min: 0.001, max: 1 },
    { id: 'ETH', name: 'UDC', min: 0.01, max: 10 },
    { id: 'USDT', name: 'USDT', min: 10, max: 1000 },
  ];

  const handleInputChange = (field: string, value: string | number) => {
    switch (field) {
      case 'recipient':
        setRecipient(value as string);
        break;
      case 'amount':
        setAmount(Number(value));
        break;
      case 'currency':
        setCurrency(value as string);
        setCurrencyDropdownOpen(false);
        break;
      case 'message':
        setMessage(value as string);
        break;
      case 'mailAddress':
        setMailAddress(value as string);
        break;
      case 'theme':
        setTheme(value as 'blue' | 'purple' | 'green' | 'gold');
        break;
    }

    onUpdate({
      recipient: field === 'recipient' ? value as string : recipient,
      amount: field === 'amount' ? Number(value) : amount,
      currency: field === 'currency' ? value as string : currency,
      message: field === 'message' ? value as string : message,
      mailAddress: field === 'mailAddress' ? value as string : mailAddress,
      theme: field === 'theme' ? value as 'blue' | 'purple' | 'green' | 'gold' : theme,
    });
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!recipient) {
        toast({
          title: "Recipient name required",
          description: "Please enter the recipient's name",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      if(Number(userReadAllowance) >= amount) {
        await handleCreateContract()
      } else {
        await writeContractAsync(simulateApproval!.request);
        await handleCreateContract();
      }

      
      // console.log(result);

    } catch (error) {
      console.error("Gift card creation failed:", error);
      const decodedError: DecodedError = await errorDecoder.decode(error)
      console.log(`Revert reason: ${decodedError.reason}`)

      if (decodedError.reason?.includes("Cannot read properties of undefined (reading 'id')")) {
        toast({
          title: "Switch to Supported Network",
          description: "UnSupported Network",
          variant: "destructive",
        });
      }

      toast({
        title: "Gift card creation failed",
        description: "Please check the recipient address and your balance",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.id === currency);

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="recipient" className="block text-sm font-medium text-crypto-dark">
            Recipient Wallet Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="recipient"
              value={recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-crypto-blue focus:ring-crypto-blue input-focus-ring py-2 border"
              placeholder="Enter recipient's address"
            />
          </div>
        </div>
        {/* Mail Address */}
        <div className="space-y-2">
          <label htmlFor="recipient" className="block text-sm font-medium text-crypto-dark">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="mailAddress"
              value={mailAddress}
              onChange={(e) => handleInputChange('mailAddress', e.target.value)}
              className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-crypto-blue focus:ring-crypto-blue input-focus-ring py-2 border"
              placeholder="Enter mail address"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-crypto-dark">
            Amount
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Gift className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                min={selectedCurrency?.min || 0}
                max={selectedCurrency?.max || 100}
                step={selectedCurrency?.id === 'BTC' ? 0.001 : selectedCurrency?.id === 'ETH' ? 0.01 : 1}
                className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-crypto-blue focus:ring-crypto-blue input-focus-ring py-2 border"
                placeholder="Enter amount"
              />
            </div>

            <div className="relative z-20">
              <button
                type="button"
                className="flex items-center justify-between w-24 rounded-lg border border-gray-300 px-3 py-2 bg-white text-crypto-dark shadow-sm hover:bg-gray-50 transition-smooth"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              >
                <span className="font-medium">{currency}</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", currencyDropdownOpen ? "rotate-180" : "")} />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-lg bg-white shadow-lg p-1 z-30 animate-fade-in">
                  {currencies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-crypto-light-gray transition-smooth",
                        currency === c.id && "bg-crypto-light-gray"
                      )}
                      onClick={() => handleInputChange('currency', c.id)}
                    >
                      <span className="flex-1 text-left">{c.name}</span>
                      {currency === c.id && <Check className="h-4 w-4 text-crypto-blue" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-crypto-gray mt-1">
            Min: {selectedCurrency?.min || 0} {currency} | Max: {selectedCurrency?.max || 100} {currency}
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-crypto-dark">
            Personal Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-crypto-blue focus:ring-crypto-blue input-focus-ring py-2 border"
            placeholder="Add a personal message..."
            maxLength={100}
          />
          <p className="text-xs text-right text-crypto-gray">{message.length}/100</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-crypto-dark flex items-center">
            <Palette className="h-4 w-4 mr-1" /> Choose Card Theme
          </label>
          <div className="flex space-x-3">
            {[
              { id: 'blue', color: 'bg-blue-500' },
              { id: 'purple', color: 'bg-purple-500' },
              { id: 'green', color: 'bg-emerald-500' },
              { id: 'dark', color: 'bg-gray-800' },
              { id: 'gold', color: 'bg-gradient-to-r from-amber-300 to-yellow-600' },
            ].map((colorOption) => (
              /* eslint-disable @typescript-eslint/no-explicit-any */
              <button
                key={colorOption.id}
                type="button"
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-transform",
                  theme === colorOption.id && "ring-2 ring-offset-2 ring-crypto-blue scale-110"
                )}

                onClick={() => handleInputChange('theme', colorOption.id as any)}
              >
                <span className={`w-6 h-6 rounded-full ${colorOption.color}`}></span>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          iconLeft={<CreditCard className="mr-1 h-5 w-5" />}
        >
          Create Gift Card
        </Button>
      </form>
    </div>
  );
};

export default GiftCardCustomizer;
