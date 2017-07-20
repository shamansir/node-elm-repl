module Records exposing (A, B, C, Recursive)

type alias A = { a: String }

type alias B =
    { a: A
    , b: List Int
    }

type alias C =
    { field1: B
    , field2: MyUnionType
    , field3: A
    , field4: MySecondUnionType Bool
    }

type Recursive = Recursive
    { field1: Recursive
    , field2: C
    }

type MyUnionType = MyInt Int | MyStr String

type MySecondUnionType a = MySecondInt Int | MySecondStr String | MySecondList (List a)
