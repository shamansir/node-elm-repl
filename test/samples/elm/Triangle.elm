module Triangle exposing (..)


version : Int
version =
    2

type alias ErrorDescription = String

type Triangle = Equilateral | Isosceles | Scalene

triangleKind : Float -> Float -> Float -> Result ErrorDescription Triangle
triangleKind a b c =
    case testValidity a b c of
        Nothing ->
            if isEquilaterial a b c then Ok Equilateral
            else if isIsosceles a b c then Ok Isosceles
            else Ok Scalene
        Just errorStr -> Err errorStr

testValidity : Float -> Float -> Float -> Maybe ErrorDescription
testValidity a b c =
    if (a <= 0) || (b <= 0) || (c <= 0) then Just "Invalid lengths"
    else if (a + b <= c) || (a + c <= b) || (b + c <= a) then Just "Violates inequality"
    else Nothing

isIsosceles : Float -> Float -> Float -> Bool
isIsosceles a b c =
    (a == b) || (b == c) || (a == c)

isEquilaterial : Float -> Float -> Float -> Bool
isEquilaterial a b c =
    (a == b) && (b == c)
