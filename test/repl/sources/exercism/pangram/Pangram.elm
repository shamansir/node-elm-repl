module Pangram exposing (..)

import String
import Char
import Set

isPangram : String -> Bool
isPangram str =
    (findLetterCount str) == 26

findLetterCount : String -> Int
findLetterCount str =
    str
        |> String.toLower -- convert all chars in a string to lower case
        |> String.toList -- convert the result to a list of chars
        |> List.map Char.toCode -- map this list to a list of char codes
        |> List.filter isLetter -- leave only letter-codes (from 97 `a` to 122 `z`) in this list
        |> List.map subtractA -- sustract a code of letter `<'a'> - 1` (which is 97 - 1 = 96)
                              -- from every char code, so we get a list of numbers from 1 (`a`) to 26 (`z`)
        |> Set.fromList -- remove duplicates of the codes, so every number from 1 to 26
                        -- now appears (if ever appears) in the list only once
        |> Set.size -- take the length

isLetter : Char.KeyCode -> Bool
isLetter code =
    (code >= 97) && (code <= 122)

subtractA : Int -> Int
subtractA code =
    code - 96
