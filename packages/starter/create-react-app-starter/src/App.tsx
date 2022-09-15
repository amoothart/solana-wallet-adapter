import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useAnchorWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
    PhantomWalletAdapter, 
    SlopeWalletAdapter, 
    SolflareWalletAdapter, 
    SolletExtensionWalletAdapter, 
    SolletWalletAdapter, 
    TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
    Program, web3, BN, AnchorProvider
} from '@project-serum/anchor';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import React, { FC, ReactNode, useMemo } from 'react';
import idl from './idl.json'
 
require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            // new LedgerWalletAdapter(), //Throws buffer not defined exception
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet =  useAnchorWallet();
    const baseAccount = web3.Keypair.generate()

    function getProvider() {
        if (!wallet) {
            return null;
        }

        const network = "http://127.0.0.1:8899";
        const connection = new Connection(network, "processed");

        const provider = new AnchorProvider(
            connection, wallet, {"preflightCommitment": "processed"},
        );
        return provider;
    }

    async function createCounter() {
        const provider = getProvider()
        if(!provider) {
            throw new Error("Provider is null")
        }

        /* hack for idl type not being recognized */
        const a = JSON.stringify(idl)
        const b = JSON.parse(a)
        const program = new Program(b, idl.metadata.address, provider)
        try {
            await program.rpc.initialize({
                accounts: {
                    myAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId
                },
                signers: [baseAccount]
            })

            const account = await program.account.myAccount.fetch(baseAccount.publicKey)
            console.log('account: ', account)
        } catch (err) {
            console.log("Transacion error", err)
        }
    }

    async function increment() {
        const provider = getProvider()
        if(!provider) {
            throw new Error("Provider is null")
        }

        /* hack for idl type not being recognized */
        const a = JSON.stringify(idl)
        const b = JSON.parse(a)
        const program = new Program(b, idl.metadata.address, provider)
        try {
            await program.rpc.increment({
                accounts: {
                    myAccount: baseAccount.publicKey,
                }
            })

            const account = await program.account.myAccount.fetch(baseAccount.publicKey)
            console.log('account: ', account.data.toString())
        } catch (err) {
            console.log("Transacion error", err)
        }
    }

    async function decrement() {
        const provider = getProvider()
        if(!provider) {
            throw new Error("Provider is null")
        }

        /* hack for idl type not being recognized */
        const a = JSON.stringify(idl)
        const b = JSON.parse(a)
        const program = new Program(b, idl.metadata.address, provider)
        try {
            await program.rpc.decrement({
                accounts: {
                    myAccount: baseAccount.publicKey,
                }
            })

            const account = await program.account.myAccount.fetch(baseAccount.publicKey)
            console.log('account: ', account.data.toString())
        } catch (err) {
            console.log("Transacion error", err)
        }
    }

    async function update() {
        const provider = getProvider()
        if(!provider) {
            throw new Error("Provider is null")
        }

        /* hack for idl type not being recognized */
        const a = JSON.stringify(idl)
        const b = JSON.parse(a)
        const program = new Program(b, idl.metadata.address, provider)
        try {
            await program.rpc.
            // currently fails with 'Buffer is not defined'
            update(new BN(100), {
                accounts: {
                    myAccount: baseAccount.publicKey,
                }
            })

            const account = await program.account.myAccount.fetch(baseAccount.publicKey)
            console.log('account: ', account.data.toString())
        } catch (err) {
            console.log("Transacion error", err)
        }
    }

    return (
        <div className="App">
            <button onClick={createCounter}>Initialize</button>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
            <button onClick={update}>Update</button>
            <WalletMultiButton />
        </div>
    );
};
