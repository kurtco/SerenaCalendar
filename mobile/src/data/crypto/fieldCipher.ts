import forge from 'node-forge';
import * as Crypto from 'expo-crypto';
import { Base64 } from 'js-base64';

const NONCE_SIZE = 12; // GCM recommended nonce size
const TAG_LENGTH_BITS = 128;

export interface FieldCipher {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
}

function u8ToBinaryString(u8: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < u8.length; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return binary;
}

function binaryStringToU8(binary: string): Uint8Array {
  const u8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    u8[i] = binary.charCodeAt(i);
  }
  return u8;
}

function bytesToBase64(binary: string): string {
  return Base64.fromUint8Array(binaryStringToU8(binary));
}

function base64ToBytes(b64: string): string {
  return u8ToBinaryString(Base64.toUint8Array(b64));
}

export async function createFieldCipher(dek: Uint8Array): Promise<FieldCipher> {
  if (dek.length !== 32) {
    throw new Error('DEK must be 256 bits (32 bytes)');
  }

  const key = u8ToBinaryString(dek);

  return {
    encrypt: async (plaintext: string): Promise<string> => {
      const nonceU8 = await Crypto.getRandomBytesAsync(NONCE_SIZE);
      const nonce = u8ToBinaryString(nonceU8);

      const cipher = forge.cipher.createCipher('AES-GCM', key);
      cipher.start({
        iv: forge.util.createBuffer(nonce, 'raw'),
        tagLength: TAG_LENGTH_BITS,
      });
      cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
      cipher.finish();

      const ciphertext = cipher.output.getBytes();
      const tag = cipher.mode.tag.getBytes();

      const payload = nonce + ciphertext + tag;
      return bytesToBase64(payload);
    },

    decrypt: async (ciphertext: string): Promise<string> => {
      const payload = base64ToBytes(ciphertext);
      if (payload.length < NONCE_SIZE + TAG_LENGTH_BITS / 8) {
        throw new Error('Ciphertext too short');
      }

      const nonce = payload.slice(0, NONCE_SIZE);
      const tagStart = payload.length - TAG_LENGTH_BITS / 8;
      const encrypted = payload.slice(NONCE_SIZE, tagStart);
      const tag = payload.slice(tagStart);

      const decipher = forge.cipher.createDecipher('AES-GCM', key);
      decipher.start({
        iv: forge.util.createBuffer(nonce, 'raw'),
        tagLength: TAG_LENGTH_BITS,
        tag: forge.util.createBuffer(tag, 'raw'),
      });
      decipher.update(forge.util.createBuffer(encrypted, 'raw'));
      const success = decipher.finish();
      if (!success) {
        throw new Error('Decryption failed: authentication tag mismatch');
      }

      return forge.util.decodeUtf8(decipher.output.getBytes());
    },
  };
}
