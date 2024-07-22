import Forge from 'node-forge';

class Cryptography {
    private PrivateKey: string;
    private PublicKey: string;

    /**
     * Initializes a new instance of the Cryptography class.
     *
     * @constructor
     */
    constructor() {
        this.PrivateKey = "";
        this.PublicKey = "";
    }

    /**
     * Generates a new pair of RSA key pairs.
     *
     * @return {this} The current instance of the class.
     */
    public generateNewPair() {
        const { publicKey, privateKey } = Forge.pki.rsa.generateKeyPair(2048);
        const publicKeyPem = Forge.pki.publicKeyToPem(publicKey);
        const privateKeyPem = Forge.pki.privateKeyToPem(privateKey);
        this.PrivateKey = privateKeyPem;
        this.PublicKey = publicKeyPem;
        return this;
    }

    /**
     * Retrieves the private key.
     *
     * @return {string} The private key.
     */
    public getPrivateKey() {
        return this.PrivateKey;
    }

    /**
     * Retrieves the public key from the instance.
     *
     * @return {string} The public key as a string.
     */
    public getPublicKey() {
        return this.PublicKey;
    }
}

export default Cryptography;