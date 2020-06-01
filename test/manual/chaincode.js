/* eslint no-console: 0 */
const {FileSystemWallet, Gateway} = require('fabric-network');
const path = require('path');
const profile = require('./connection');

async function main() {
    try {
        const walletPath = path.resolve(__dirname, 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(profile, {
            wallet,
            identity: 'admin',
            discovery: {
                enabled: true,
                asLocalhost: false
            }
        });

        // Get the network channel that the smart contract is deployed to.
        const network = await gateway.getNetwork('sg');

        // Get the smart contract from the network channel.
        const contract = network.getContract('transfer');

        // Submit the 'createCar' transaction to the smart contract, and wait for it
        // to be committed to the ledger.
        const result = await contract.submitTransaction('push', JSON.stringify({
            debit: 'user1@domain.com',
            credit: 'user2@domain.com',
            amount: 100
        }));
        console.log('Transaction has been submitted', JSON.parse(Buffer.from(JSON.parse(result))));

        await gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
    }
}
main();
