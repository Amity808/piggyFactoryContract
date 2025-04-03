import { createConfig, http } from "wagmi";
import { eduChainTestnet  } from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

export const supportedNetworks = [eduChainTestnet];

export const config = createConfig({
    chains: supportedNetworks,
    multiInjectedProviderDiscovery: true, // default to true though
    connectors: [
        walletConnect({ projectId: process.env.REOWN_PROJECT_ID }),
    ],
    transports: {
        [eduChainTestnet.id]: http(),
    },
});


