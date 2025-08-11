// test/crypto-test.js
// Test crypto utility functionality

const testCrypto = async () => {
  console.log('🔐 Testing crypto functionality...');
  
  // Set up test environment BEFORE dynamic import
  process.env.APP_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  
  try {
    // Dynamic import after setting environment
    const crypto = await import('../dist/lib/crypto.js');
    
    const testMessage = 'sk-test-api-key-1234567890abcdef';
    
    // Test encryption
    const encrypted = crypto.encrypt(testMessage);
    console.log('✅ Encryption works');
    console.log(`   - Ciphertext length: ${encrypted.ciphertext.length}`);
    console.log(`   - IV length: ${encrypted.iv.length}`);
    console.log(`   - Tag length: ${encrypted.tag.length}`);
    
    // Test decryption
    const decrypted = crypto.decrypt(encrypted.ciphertext, encrypted.iv, encrypted.tag);
    console.log('✅ Decryption works');
    
    // Verify round-trip
    if (decrypted === testMessage) {
      console.log('✅ Round-trip encryption/decryption successful');
    } else {
      throw new Error('Round-trip failed');
    }
    
    console.log('✅ All crypto tests passed');
    
  } catch (error) {
    console.error('❌ Crypto test failed:', error.message);
    process.exit(1);
  }
};

testCrypto();