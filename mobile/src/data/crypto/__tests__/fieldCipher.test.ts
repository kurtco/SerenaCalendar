import { createFieldCipher } from '../fieldCipher';

describe('FieldCipher', () => {
  it('encrypts and decrypts a sensitive value', async () => {
    const dek = new Uint8Array(32);
    // deterministic but known key for the test
    for (let i = 0; i < dek.length; i++) {
      dek[i] = i;
    }

    const cipher = await createFieldCipher(dek);
    const plaintext = 'heavy';

    const ciphertext = await cipher.encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(ciphertext).not.toContain(plaintext);

    const decrypted = await cipher.decrypt(ciphertext);
    expect(decrypted).toBe(plaintext);
  });
});
