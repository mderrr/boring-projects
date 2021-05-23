myElem :: Eq a => a -> [a] -> Bool 
myElem _ [] = False 
myElem item (x:xs)
    | x == item  = True
    | otherwise  = myElem item xs

result :: Bool 
result = myElem 13 [2, 3, 4, 21]

main = print result