/**
 * Security Utility for Client-Side Encryption
 * Uses Web Crypto API to protect data in LocalStorage/IndexedDB
 */

const ENCRYPTION_KEY_NAME = 'swipe_them_enc_key';

/**
 * Generates or retrieves a persistent symmetric key for this browser session/user.
 * Note: For true "at rest" security against physical access, the user should 
 * ideally provide a password, but for automated local hardening, we use 
 * a browser-persistent key.
 */
async function getOrCreateKey(): Promise<CryptoKey> {
    const stored = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (stored) {
        const keyData = JSON.parse(stored);
        return await crypto.subtle.importKey(
            'jwk',
            keyData,
            { name: 'AES-GCM' },
            true,
            ['encrypt', 'decrypt']
        );
    }

    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const exported = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exported));
    return key;
}

/**
 * Encrypts a string using AES-GCM
 */
export async function encryptData(data: string): Promise<{ cipherText: string; iv: string }> {
    const key = await getOrCreateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );

    return {
        cipherText: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

/**
 * Decrypts a string using AES-GCM
 */
export async function decryptData(cipherText: string, iv: string): Promise<string> {
    const key = await getOrCreateKey();
    const encryptedData = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivData },
        key,
        encryptedData
    );

    return new TextDecoder().decode(decrypted);
}
