import { createHash, createCipheriv, createDecipheriv, randomBytes } from "crypto";
export function generateToken(): string {
    const segmentLength: number = 4;
    const segmentCount: number = 4;
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength: number = characters.length;
    let randomString: string = '';
  
    for (let i = 0; i < segmentCount; i++) {
      for (let j = 0; j < segmentLength; j++) {
        randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      
      if (i < segmentCount - 1) {
        randomString += '-';
      }
    }
  
    return randomString;
}



/**
 * Calculates the SHA1 hash of the input buffer.
 *
 * @param {Buffer} input - The input buffer to calculate the hash from.
 * @return {Buffer} The SHA1 hash of the input buffer.
 */
export function sha1(input: Buffer) {
  return createHash('sha1').update(input).digest();
}

/**
 * Derives a key from a password, salt, and number of iterations.
 *
 * @param {string} password - The password to derive the key from.
 * @param {string} salt - The salt to add to the password.
 * @param {number} iterations - The number of iterations to perform.
 * @param {number} len - The desired length of the derived key.
 * @return {Buffer} The derived key as a Buffer.
 */
export function password_derive_bytes(password: string, salt: string, iterations: number, len: number) {
  var key = Buffer.from(password + salt);
  for (var i = 0; i < iterations; i++) {
      key = sha1(key);
  }
  if (key.length < len) {
      var hx = password_derive_bytes(password, salt, iterations - 1, 20);
      for (var counter = 1; key.length < len; ++counter) {
          key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))]);
      }
  }
  return Buffer.alloc(len, key);
}

/**
 * Encrypts the input text using AES-256-CBC encryption.
 *
 * @param {string} text - The text to be encrypted
 * @return {string} The encrypted text in base64 format
 */
export function encryptString(text: string) {
  var key = password_derive_bytes(process.env.SECRET_KEY as string, '', 100, 32);
  var cipher = createCipheriv('aes-256-cbc', key, Buffer.from(process.env.IV_KEY as string));
  var part1 = cipher.update(text, 'utf8');
  var part2 = cipher.final();
  const encrypted = Buffer.concat([part1, part2]).toString('base64');
  return encrypted;
}

  
/**
 * Decrypts the encrypted data using AES-256-CBC algorithm.
 *
 * @param {string} encryptedData - The data to decrypt.
 * @return {string} The decrypted data.
 */
export function decryptString(encryptedData: string) {
  var key = password_derive_bytes(process.env.SECRET_KEY as string, '', 100, 32);
  var decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(process.env.IV_KEY as string));
  var decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final();
  return decrypted;
}