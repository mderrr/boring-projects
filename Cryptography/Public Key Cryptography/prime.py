import secrets

REFERENCE_PRIME_LIST = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199]

def getRandomNumber(bits): 
    number = secrets.SystemRandom().randrange((2 ** (bits - 1)) + 1, 2 ** bits)

    return number

# Using the miller rabin test,
def isPrime(candidate, number_of_iterations = 20):
    even_component = candidate - 1
    max_divisions_by_two = 0
    is_composite = True
    
    while (even_component % 2 == 0):
        max_divisions_by_two += 1
        even_component >>= 1

    assert(2 ** max_divisions_by_two * even_component == candidate - 1) 

    for _ in range(number_of_iterations): 
        test_number = secrets.SystemRandom().randrange(2, candidate)

        if pow(test_number, even_component, candidate) == 1: 
            is_composite = False

        for j in range(max_divisions_by_two): 
            if pow(test_number, 2 ** j * even_component, candidate) == candidate - 1: 
                is_composite = False

        if is_composite: 
            return False

    return True

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

def getPrimeNumber(bits):
    def getPrimeCandidate(bits): 
        candidate_found = False

        while not candidate_found:  
            prime_candidate = secrets.randbits(bits)  
    
            for divisor in REFERENCE_PRIME_LIST:  
                if (prime_candidate % divisor == 0) and (divisor ** 2 <= prime_candidate): 
                    break
                
                else: 
                    candidate_found = True
                
        return prime_candidate  

    def passedMillerRabinTest(candidate, number_of_iterations = 20):
        even_component = candidate - 1
        max_divisions_by_two = 0
        is_composite = True
        
        while (even_component % 2 == 0):
            max_divisions_by_two += 1
            even_component >>= 1

        assert(2 ** max_divisions_by_two * even_component == candidate - 1) 
    
        for _ in range(number_of_iterations): 
            test_number = secrets.SystemRandom().randrange(2, candidate)

            if pow(test_number, even_component, candidate) == 1: 
                is_composite = False

            for j in range(max_divisions_by_two): 
                if pow(test_number, 2 ** j * even_component, candidate) == candidate - 1: 
                    is_composite = False

            if is_composite: 
                return False

        return True

    prime_found = False

    while not prime_found:
        prime_cadidate = getPrimeCandidate(bits)

        if passedMillerRabinTest(prime_cadidate):
            prime_found = True         

    return prime_cadidate

def getSophieGermainPrime(bits):
    sophie_germain_prime_bits = bits - 1
    prime_pair_found = False

    while not prime_pair_found:
        sophie_germain_prime = getPrimeNumber(sophie_germain_prime_bits)
        safe_prime = (2 * sophie_germain_prime) + 1

        if isPrime(safe_prime):
            prime_pair_found = True
    
    return sophie_germain_prime, safe_prime
            
def getModulusAndBase(bits):
    sophie_germain_prime, modulus = getSophieGermainPrime(bits)
    exponents_to_check = [1, 2, sophie_germain_prime]

    for base in range(2, sophie_germain_prime):
        errors = 0

        for exponent in exponents_to_check:
            if pow(base, exponent, modulus) == 1:
                errors += 1

        if errors == 0:
            break

    return modulus, base  
  
if __name__ == '__main__': 
    # For a resonable performance max 256bit number.
    print("modulus, base", getModulusAndBase(256))