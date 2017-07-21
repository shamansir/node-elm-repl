module ComplexTypes exposing (..)

import Html exposing (..)

testComplexType : Html a -> List (Html a) -> {
    model: model, update: msg -> model -> model,
    view: model -> Html msg
} -> Program Never model msg
testComplexType skip skip2 =
    Html.beginnerProgram
