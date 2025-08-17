import { Injectable } from '@angular/core';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

/**
 * Provides methods for securely encrypting and decrypting data using a predefined secret key.
 * This service is designed to handle sensitive information, ensuring data is securely stored or transmitted.
 *
 * The `StorageLockService` uses AES encryption for data encryption and decryption.
 * It is configured to be available throughout the application by being registered as a root service.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageLockService {
  private secretKey = 'Travellion-Client-Secret';

  /**
   * Encrypts a given string using AES encryption and the specified secret key.
   *
   * @param {string} value - The plaintext string to be encrypted.
   * @return {string} The encrypted string in ciphertext format.
   */
  encrypt(value: string): string {
    return AES.encrypt(value, this.secretKey).toString();
  }

  /**
   * Decrypts an encrypted string using AES decryption.
   *
   * @param {string} encryptedValue - The encrypted string that needs to be decrypted.
   * @return {string} The decrypted string in plaintext.
   */
  decrypt(encryptedValue: string): string {
    const bytes = AES.decrypt(encryptedValue, this.secretKey);
    return bytes.toString(Utf8);
  }
}
