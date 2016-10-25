module DifferenceOfSquares exposing (..)

factorial : Float -> Float
factorial n =
    if (n <= 1) then
        1
    else
        n + factorial (n - 1)

squareOfSum : Float -> Float
squareOfSum n =
    (factorial n) ^ 2

sumOfSquares : Float -> Float
sumOfSquares n =
    if (n <= 1) then
        1
    else
        (n ^ 2) + sumOfSquares (n - 1)

difference : Float -> Float
difference n =
    (squareOfSum n) - (sumOfSquares n)
