import secrets, time, os

MODULUS_AND_BASE_MESSAGE = "Modulus: {}, Base {}."
ELAPSED_TIME_MESSAGE = "The function {} took {}{} to run."

GETTING_SAFE_PRIME_INFO = "Getting safe prime..."

PRIME_SAVE_PATH = "./Prime/prime.txt"
RELATIVE_SAVE_PATH = "./prime.txt"

MILLISECONDS = "ms"
SECONDS = "s"
MINUTES = "min"

WINDOWS_OS_NAME = "nt"
LINUX_OS_NAME = "posix"
WIN_CLEAR = "cls"
LINUX_CLEAR = "clear"

FILE_MODE = "w"

REFERENCE_PRIME_LIST = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199]

def clear():
    if (os.name == WINDOWS_OS_NAME):
        os.system(WIN_CLEAR)
    elif (os.name == LINUX_OS_NAME):
        os.system(LINUX_CLEAR)

def measureTime(function):
    def inner(*args, **kwargs):
        starting_time = time.time()
        to_execute = function(*args, **kwargs)
        ending_time = time.time()
        elapsed_time = ending_time - starting_time

        if (elapsed_time > 60):
            elapsed_time /= 60
            time_unit = MINUTES

        elif (elapsed_time < 1):
            elapsed_time *= 1000
            time_unit = MILLISECONDS

        else:
            time_unit = SECONDS

        clear()
        print(ELAPSED_TIME_MESSAGE.format(function.__name__, round(elapsed_time), time_unit))

        return to_execute
    
    return inner

def inform(message):
    clear()
    print(message)

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
    inform(GETTING_SAFE_PRIME_INFO)

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

    with open(PRIME_SAVE_PATH, FILE_MODE) as text_file:
        text_file.write(str(safe_prime))

    return safe_prime, primitive_root  
  
if __name__ == '__main__': 
    PRIME_SAVE_PATH = RELATIVE_SAVE_PATH

    # For a resonable performance max 256bit number.
    modulus, base = getModulusAndBase(512)

    print(MODULUS_AND_BASE_MESSAGE.format(modulus, base))