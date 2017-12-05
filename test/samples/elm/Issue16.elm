module Issue16 exposing (view, Msg)

import Html exposing (Html, span, text)

type Msg = Test1 String | Test2 Int

view : Float -> Html Msg
view n =
    span [] [ toString n |> text ]
