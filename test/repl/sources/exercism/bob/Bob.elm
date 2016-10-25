module Bob exposing (..)

import String

type Phrase
    = NotDetermined
    | Silence
    | Statement
    | Question
    | Shout

determine : String -> Phrase
determine str =
    if String.isEmpty (String.trim str) then
        Silence
    else if (String.toUpper str) == str
         && (String.toLower str) /= str then
        Shout
    else if String.endsWith "?" str then
        Question
    else
        Statement

response : Phrase -> String
response phrase =
    case phrase of
        NotDetermined ->
            "My bad."
        Silence ->
            "Fine. Be that way!"
        Statement ->
            "Whatever."
        Question ->
            "Sure."
        Shout ->
            "Whoa, chill out!"

hey : String -> String
hey request =
    determine request
        |> response
