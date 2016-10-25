module Anagram exposing (..)

import String

sortChars: String -> String
sortChars source =
    source
        |> String.toList
        |> List.sort
        |> String.fromList

isAnagram: String -> String -> Maybe String
isAnagram subject sample =
    let
        lowerSubject = String.toLower subject
        lowerSample = String.toLower sample
    in
        if String.toLower lowerSubject ==
           String.toLower lowerSample then
            Nothing
        else if sortChars lowerSubject ==
                sortChars lowerSample then
            Just sample
        else
            Nothing

detect : String -> List String -> List String
detect subject samples =
    List.filterMap (isAnagram subject) samples
