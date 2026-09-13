import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Base64 } from 'js-base64';

const DEK_KEY = 'serena_dek';
const DEK_SIZE_BYTES = 32; // AES-256

async function generateDek(): Promise<Uint8Array> {
  return await Crypto.getRandomBytesAsync(DEK_SIZE_BYTES);
}

export async function getOrCreateDek(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(DEK_KEY);
  if (existing) {
    return Base64.toUint8Array(existing);
  }

  const dek = await generateDek();
  const encoded = Base64.fromUint8Array(dek);
  await SecureStore.setItemAsync(DEK_KEY, encoded);
  return dek;
}

export async function deleteDek(): Promise<void> {
  await SecureStore.deleteItemAsync(DEK_KEY);
}
