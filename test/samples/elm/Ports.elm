port module Ports exposing (..)

port outcome : List String -> Cmd msg
port income : (Bool -> msg) -> Sub msg
