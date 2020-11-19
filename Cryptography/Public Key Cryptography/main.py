import secrets

#number = secrets.randbits(256)#secrets.SystemRandom().randint(0,2131231312)

#print(number)

p = 23
g = 5

alice = secrets.SystemRandom().randint(0, 9)
bob = secrets.SystemRandom().randint(0, 9)

A = (g ** alice) % p
B = (g ** bob) % p


print(A)
print(B)

alice_s = (B ** alice) % p
bob_s = (A ** bob) % p

print(alice_s)
print(bob_s)