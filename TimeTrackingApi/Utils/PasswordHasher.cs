using System.Security.Cryptography;

namespace TimeTrackingApi
{
    public static class PasswordHasher
    {
        private const int SaltSize = 16;
        private const int KeySize = 32;
        private const int Iterations = 10000;

        public static byte[] Hash(string password)
        {
            // Generate salt
            var salt = RandomNumberGenerator.GetBytes(SaltSize);

            // Generate key using PBKDF2
            var key = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                KeySize
            );

            // Combine salt + key
            var hashBytes = new byte[SaltSize + KeySize];
            Buffer.BlockCopy(salt, 0, hashBytes, 0, SaltSize);
            Buffer.BlockCopy(key, 0, hashBytes, SaltSize, KeySize);

            return hashBytes;
        }

        public static bool Verify(string password, byte[] hashBytes)
        {
            var salt = new byte[SaltSize];
            Buffer.BlockCopy(hashBytes, 0, salt, 0, SaltSize);

            var key = new byte[KeySize];
            Buffer.BlockCopy(hashBytes, SaltSize, key, 0, KeySize);

            var keyToCheck = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                KeySize
            );

            return keyToCheck.SequenceEqual(key);
        }
    }
}
