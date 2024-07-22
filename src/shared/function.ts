import { createHash, createCipheriv, createDecipheriv } from "crypto";
import NextCrypto from "next-crypto";
// import faker from "@faker-js/faker";
import {faker} from '@faker-js/faker/locale/en';

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
 * @deprecated Use `encryptStringV2`
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
 * @deprecated Use `decryptStringV2`
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

/**
 * Encrypts the input `value` using the provided `key`.
 *
 * @param {string} value - The value to encrypt
 * @param {string} key - The key used for encryption (default: process.env.SECRET_KEY)
 * @return {string} The encrypted string
 */
export function encryptStringV2(value: string, key = process.env.SECRET_KEY as string) {
    const encryptKey = new NextCrypto(key);
    const encryptedString = encryptKey.encrypt(value);
    return encryptedString;
}

/**
 * Decrypts the input value using the provided key.
 *
 * @param {string} value - The value to decrypt
 * @param {string} key - The key used for decryption (default: process.env.SECRET_KEY)
 * @return {string} The decrypted string
 */
export function decryptStringV2(value: string, key = process.env.SECRET_KEY as string) {
    const decryptKey = new NextCrypto(key);
    const decryptedString = decryptKey.decrypt(value);
    return decryptedString;
}

/**
 * Generates a fake password with a specified length.
 *
 * @param {number} [length=12] - The length of the password.
 * @return {string} The generated fake password.
 */
export function generateFakePassword(length: number = 12) {
    return faker.internet.password(length, false, /[A-Za-z0-9]/, '!1A');
}

/**
 * Retrieves a random element from the given array.
 *
 * @param {Array<string>} array - The array from which to select a random element.
 * @return {string} The randomly selected element from the array.
 */
export function getRandomElement(array: Array<string>) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates a readable password by combining a noun, an adjective, a number, and a special character.
 *
 * @return {string} The generated password.
 */
export function generateReadablePassword() {
  const word1 = faker.word.noun();
  const word2 = faker.word.adjective();
  const word3 = faker.word.interjection();
  const number = faker.datatype.number({ min: 1000, max: 20000 });
  const char = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '?'];
  const specialChar1 = getRandomElement(char); // Pick a random special character
  const specialChar2 = getRandomElement(char); // Pick a random special character
  const specialChar3 = getRandomElement(char); // Pick a random special character
  const password = `${word1}${specialChar1}${word2}${specialChar2}${word3}${specialChar3}${number}`;
  return password;
}

/**
 * Generates a random one-time password (OTP) with a minimum value of 100000 and a maximum value of 999999.
 *
 * @return {number} The generated OTP.
 */
export function generateOTP() {
    return faker.datatype.number({ min: 199999, max: 999999 });
}