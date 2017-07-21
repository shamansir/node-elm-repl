module InnerModule.InnerTypes exposing (A, B(..))

import Dict

type alias A = Dict.Dict String Int

type B = C | D | E

type F a = Single a | Many (List a)
