using System;
using System.Collections.Generic;
using System.Collections;
using System.Diagnostics;
using System.Security.Cryptography;
using System.Numerics;

namespace Public_Key_Criptography
{
    class Program
    {
        private static RNGCryptoServiceProvider cryptoServiceProvider = new RNGCryptoServiceProvider();

        private static int[] primeReferenceArray = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199};

        private static int GetBitLength(BigInteger number) {
            BitArray bitArray = new BitArray(number.ToByteArray());

            for (int i = bitArray.Count - 1; i >= 0; i--) {
                if (bitArray[i] == true) {
                    break;
                } else {
                    bitArray.Length -= 1;
                }
            }

            return bitArray.Length;
        }

        private static byte[] ApplyBitMask(byte[] byteArray, bool makeOdd = true) {
            byte[] unsignedByteArray = new byte[byteArray.Length + 1];
            BitArray bitArray = new BitArray(byteArray);

            bitArray[bitArray.Length - 1] = true;

            if (makeOdd) {
                bitArray[0] = true;
            }
            
            bitArray.CopyTo(byteArray, 0);

            Array.Copy(byteArray, unsignedByteArray, byteArray.Length);

            return unsignedByteArray;
        }

        private static BigInteger GenerateRandomNumber(int bits) {
            int numberOfBytes = (int) Math.Ceiling((decimal) bits / 8);
            byte[] byteArray = new byte[numberOfBytes];

            cryptoServiceProvider.GetBytes(byteArray); 
            byteArray = ApplyBitMask(byteArray, false);

            return new BigInteger(byteArray);
        }

        private static BigInteger GenerateRandomOddNumber(int bits) {
            int numberOfBytes = bits / 8;
            byte[] byteArray = new byte[numberOfBytes];

            cryptoServiceProvider.GetBytes(byteArray); 
            byteArray = ApplyBitMask(byteArray);

            return new BigInteger(byteArray);
        }

        private static BigInteger GenerateRandomNumberBelow(int numberOfBytes) {
            Random random = new Random();

            byte[] data = new byte[numberOfBytes];
            random.NextBytes(data);

            return new BigInteger(data);
        }

        private static BigInteger GeneratePrimeCandidate(int bits) {
            BigInteger primeCandidate;
            bool candidateFound = false;

            do {
                primeCandidate = GenerateRandomOddNumber(bits);

                foreach (int divisor in primeReferenceArray) {
                    BigInteger squaredDivisor = BigInteger.Pow(divisor, 2);

                    if (primeCandidate % divisor == 0 && squaredDivisor <= primeCandidate) {
                        break;

                    } else {
                        candidateFound = true;

                    }
                }

            } while (candidateFound == false);

            return primeCandidate;
        }

        private static bool PassesMillerRabinTest(BigInteger candidateNumber, int numberOfIterations = 40) {
            Random random = new Random();
            BigInteger evenComponent = candidateNumber - 1;
            int numberOfCandidateBytes = candidateNumber.ToByteArray().Length;
            int maxDivisionsByTwo = 0;

            do {
                maxDivisionsByTwo += 1;
                evenComponent >>= 1;

            } while ((BigInteger) (evenComponent ^ (BigInteger) 1) == 1);
    

            for (var iteration = 0; iteration < numberOfIterations; iteration++) {
                BigInteger testNumber = GenerateRandomNumberBelow(numberOfCandidateBytes);

                if (BigInteger.ModPow(testNumber, evenComponent, candidateNumber) == 1) {
                    continue;
                }

                for (var i = 0; i < maxDivisionsByTwo; i++) {
                    if (BigInteger.ModPow(testNumber, BigInteger.Pow(2, i) * evenComponent, candidateNumber) == candidateNumber - 1) {
                        return true;
                    }
                }
                
                return false;
            }

            return true;
        }

        private static BigInteger GeneratePrimeNumber(int bits) {
            BigInteger primeNumberCandidate;

            do {
                primeNumberCandidate = GeneratePrimeCandidate(bits);

                if (PassesMillerRabinTest(primeNumberCandidate)) {
                    return primeNumberCandidate;
                }

            } while (true);
        }

        private static BigInteger GenerateSophieGermainSafePrime(int bits) {
            BigInteger sophieGermainPrime;
            BigInteger safePrime;
            
            do {
                safePrime = GeneratePrimeNumber(bits);
                sophieGermainPrime = (safePrime - 1) >> 1;

                if (PassesMillerRabinTest(sophieGermainPrime)) {
                    return safePrime;
                }

            } while (true);
        }

        private static int GetFirstPrimitiveRoot(BigInteger safePrime) {
            BigInteger sophieGermainPrime = (safePrime - 1) >> 1;
            BigInteger[] exponentsToCheck = new BigInteger[] {1, 2, sophieGermainPrime};

            for (var baseNumber = 2; baseNumber < sophieGermainPrime; baseNumber++) {
                var errors = 0;

                foreach (BigInteger exponent in exponentsToCheck) {
                    if (BigInteger.ModPow(baseNumber, exponent, safePrime) == 1) {
                        errors += 1;
                    }
                }

                if (errors == 0) {
                    return baseNumber;
                }
            }

            return 0;
        }

        private static (BigInteger, int) GenerateModulusAndBase(int bits) {
            BigInteger safePrime = GenerateSophieGermainSafePrime(bits);
            int baseNumber = GetFirstPrimitiveRoot(safePrime);

            Console.WriteLine("Safe Prime: {0}", safePrime);
            Console.WriteLine("Primitive root: {0}", baseNumber);
            
            return (safePrime, baseNumber);
        }


        static void Main(string[] args) {
            int numberOfBits = 512;

            Stopwatch sw = new Stopwatch();

            sw.Start();

            (BigInteger safePrime, int baseNumber) = GenerateModulusAndBase(numberOfBits);

            sw.Stop();

            Console.WriteLine("Elapsed={0}",sw.Elapsed);
            
        }
    }
}
