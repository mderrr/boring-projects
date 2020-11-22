import secrets
from prime import getModulusAndBase

#number = secrets.randbits(256)#secrets.SystemRandom().randint(0,2131231312)


p, g = getModulusAndBase(128)

alices_private_component = secrets.randbits(16)
bobs_private_component = secrets.randbits(16)

alices_public_component = (g ** alices_private_component) % p
bobs_public_component = (g ** bobs_private_component) % p


print("Alice's public component:", alices_public_component)
print("Bob's public component:", bobs_public_component)

alice = (bobs_public_component ** alices_private_component) % p
bob = (alices_public_component ** bobs_private_component) % p

print("Alice's secret:", alice)
print("Bob's secret:", bob)

if (alice == bob):
    print("Both are equal")