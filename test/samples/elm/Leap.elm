module Leap exposing (..)

evenlyDivisibleBy4 : Int -> Bool
evenlyDivisibleBy4 year =
    year % 4 == 0

evenlyDivisibleBy100 : Int -> Bool
evenlyDivisibleBy100 year =
    year % 100 == 0

evenlyDivisibleBy400 : Int -> Bool
evenlyDivisibleBy400 year =
    year % 400 == 0

isLeapYear : Int -> Bool
isLeapYear year =
    evenlyDivisibleBy4 year &&
        (not (evenlyDivisibleBy100 year) || evenlyDivisibleBy400 year)
