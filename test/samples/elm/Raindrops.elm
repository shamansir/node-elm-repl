module Raindrops exposing (..)

import String

factors : List Int
factors = [ 3, 5, 7 ]

hasFactor : Int -> Int -> Bool
hasFactor num factor =
    num % factor == 0

correspondingDrop : Int -> String
correspondingDrop factor =
    case factor of
        3 ->
            "Pling"
        5 ->
            "Plang"
        7 ->
            "Plong"
        _ ->
            ""

extractDrop : Int -> Int -> String
extractDrop value factor =
    if (hasFactor value factor) then
        correspondingDrop factor
    else
        ""

raindrops : Int -> String
raindrops value =
    let
        foundDrops = List.map (extractDrop value) factors
            |> String.concat
    in
        if not (String.isEmpty foundDrops) then
            foundDrops
        else
            toString value
