import secrets
from functions import measureTime
from os import system

REFERENCE_PRIME_LIST = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199]

def inform(message):
    system("cls")
    print(message + "...")

def getNumberOfBits(number):
    number_in_binary = bin(number)
    number_of_bits = len(number_in_binary) - 2

    return number_of_bits

def getRandomOddNumber(bits):
    real_bits = bits - 1
    bit_mask = (1 << 0) + (1 << real_bits) # Set the last bit to 1 so that the number is always the exact number of bits, and the first bit to 1 so the number is always odd.

    random_number = secrets.randbits(real_bits) | bit_mask

    return random_number

# Implementation of the sieve of eratosthenes.
def getPrimeNumbersListBelow(limit):
    not_prime_numbers = []
    prime_numbers = []

    for i in range(2, limit + 1):
        if i not in not_prime_numbers:
            prime_numbers.append(i)

            for j in range(i * i, limit + 1, i):
                not_prime_numbers.append(j)

    return prime_numbers

def getPrimeCandidate(bits): 
    while True:  
        prime_candidate = getRandomOddNumber(bits)  

        for divisor in REFERENCE_PRIME_LIST:  
            if (prime_candidate % divisor == 0) and (divisor ** 2 <= prime_candidate): 
                break
            
            else: 
                return prime_candidate

def passesMillerRabinTest(candidate, number_of_iterations = 40):
    system_random = secrets.SystemRandom()
    even_component = candidate - 1
    max_divisions_by_two = 0

    while not (even_component & 1):
        max_divisions_by_two += 1
        even_component >>= 1 # Same as //= 2

    for _ in range(number_of_iterations): 
        test_number = system_random.randrange(2, candidate)

        if pow(test_number, even_component, candidate) == 1: 
            continue

        for j in range(max_divisions_by_two): 
            if pow(test_number, 2 ** j * even_component, candidate) == candidate - 1: 
                return True

        return False

    return True

def getPrimeNumber(bits):
    while True:
        prime_cadidate = getPrimeCandidate(bits)

        if passesMillerRabinTest(prime_cadidate):
            return prime_cadidate       

def getSophieGermainSafePrime(bits):
    inform("Getting safe prime")

    while True:
        safe_prime = getPrimeNumber(bits)
        sophie_germain_prime = (safe_prime - 1) >> 1

        if passesMillerRabinTest(sophie_germain_prime):
            return safe_prime
   
def getFirstPrimitiveRoot(safe_prime):
    sophie_germain_prime = (safe_prime - 1) >> 1
    exponents_to_check = [1, 2, sophie_germain_prime]

    for base in range(2, sophie_germain_prime):
        errors = 0

        for exponent in exponents_to_check:
            if pow(base, exponent, safe_prime) == 1:
                errors += 1

        if not errors:
            return base
            
@measureTime
def getModulusAndBase(bits):
    safe_prime = getSophieGermainSafePrime(bits)
    primitive_root = getFirstPrimitiveRoot(safe_prime)

    with open("prime.txt", "a") as text_file:
        text_file.write(str(safe_prime))

    return safe_prime, primitive_root  
  
if __name__ == '__main__': 
    # For a resonable performance max 256bit number.
    modulus, base = getModulusAndBase(128)
    print("Modulus: {}, Base {}.".format(modulus, base))