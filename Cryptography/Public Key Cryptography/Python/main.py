import secrets
from prime import getModulusAndBase

#number = secrets.randbits(256)#secrets.SystemRandom().randint(0,2131231312)


p, g = 145360097158620730304211061847068854000638714359511163518219924866523124074525007293934679271364853091300605881184204101493814592828417533690818172602658837796064646938379601946044996699556802178636812271667905266519606962092573353416907572829137590464836273188898137458477389384200546091554097232574035215403, 2

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