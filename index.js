const {InMemoryWallet, Gateway, X509WalletMixin} = require('fabric-network');

module.exports = function hyperledger(...params) {
    return class hyperledger extends require('ut-port-script')(...params) {
        get defaults() {
            return {
                type: 'hyperledger',
                namespace: 'hyperledger',
                options: {
                    identity: 'admin',
                    discovery: {
                        enabled: true,
                        asLocalhost: false
                    }
                }
            };
        }

        async init() {
            const result = await super.init(...arguments);
            this.gateway = new Gateway();
            this.wallet = new InMemoryWallet();
            await this.wallet.import(
                this.config.options.identity,
                X509WalletMixin.createIdentity(this.config.msp, this.config.certificate, this.config.key)
            );
            return result;
        }

        async start() {
            const result = await super.start(...arguments);
            await this.gateway.connect(this.config.connection, {
                ...this.config.options,
                wallet: this.wallet
            });
            return result;
        }

        handlers() {
            return {
                exec: async(msg, {method}) => {
                    let [network, contract, fn] = method.split('.', 3);
                    if (network && contract && fn) {
                        network = await this.gateway.getNetwork(network);
                        contract = network.getContract(contract);
                        const result = await contract.submitTransaction(fn, JSON.stringify(msg));
                        return JSON.parse(Buffer.from(JSON.parse(result)));
                    } else {
                        throw new Error(`Method ${method} not found`);
                    }
                }
            };
        }
    };
};
