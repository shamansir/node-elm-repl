module Issue07 exposing (..)

import Json.Decode as Json exposing (field)
import Html


type alias User =
    { name : String
    , age : Int
    }


decodeUser : Json.Decoder User
decodeUser =
    Json.map2 User
        (field "name" Json.string)
        (field "age" Json.int)


type alias Dog =
    { breed : String }


decodeDog : Json.Decoder Dog
decodeDog =
    Json.map Dog
        (field "breed" Json.string)


type alias Cat =
    { lives : Int }


decodeCat : Json.Decoder Cat
decodeCat =
    Json.map Cat
        (field "lives" Json.int)


somethingElse : String
somethingElse =
    "example"


viewCat : Cat -> Html.Html msg
viewCat { lives } =
    "I have lived for "
        ++ (toString <| 9 - lives)
        ++ " lives"
        |> Html.text


viewDog : Dog -> Html.Html msg
viewDog { breed } =
    let
        message =
            if breed == "wolf" then
                "I am a big scary wolf! But that's not really a breed.."
            else
                "I'm just a normal old " ++ breed
    in
        Html.text message
