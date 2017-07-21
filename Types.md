## How to deconstruct Type Definitions in JS? (JS API)

When you run:

```javascript
new Repl(<options>)
    .getTypes([ <imports> ], [ <expressions> ]) // or .getTypesAndValues
    .then(function(types) {
        console.dir(types, { depth: null });
    });
```

You get the array with the detailed structures for the Elm type definition.

For a number (i.e. `2`), it is just:

```javascript
{ type: "var", name: "number" }
```

But for a lambda (i.e. `\a b -> a + b`) it is somewhat more complicated:

```javascript
{ type: "lambda",
    left: { type: "var", name: "number" },
    right:
     { type: "lambda",
       left: { type: "var", name: "number" },
       right: { type: "var", name: "number" } } }
```

So, what are the possible structures?

If you deconstruct the latter example, you may notice see that it is actually:

```javascript
{ type: "lambda",
    left: <TYPE>,
    right:
     { type: "lambda",
       left: <TYPE>,
       right: <TYPE> } }
```

Or

```javascript
{ type: "lambda",
    left: <TYPE>,
    right: <TYPE> }
```

Or... just `<TYPE>`. So, the structure of the definition is the same, but references itself recursively, since types may be enclosed in other types.

So, there is always a `type` field which defines the... type of this cell, which is either:

* `var`: if it is a type variable, like `a` in `Html a`:
    * `name`: a name of this variable, like `number` or `comparable`, `msg`, `a`, `b`, `x` ... actually anything;
* `type`: if it's a simple unary type (not union type (see [Special Cases / Union Types](#union-types)), not alias, not lambda, not application, not record, just a direct type, nowhere to go deep):
    * `def: DEFINITION`: the definition of this type, no matter the internal one or the custom one:
        * `name: string`: could be `Int`, `String`, `List`, `Bool` or any name the person who created the code gave to this type;
        * `[user]: string`: if it's an user type or an external type, then it is a name of an user (or a type author) as defined in her `elm-package.json`;
        * `[package]: string`: if it's an user type or an external type, then it is a name of a package/project as defined in its `elm-package.json`;
        * `[path]: [string]`: if it's an user type or an external type, then it follows the list of modules and type names inside, defining the way to reach this particular type;
* `lambda`: it is when you use `->` operator in Elm, be it a lambda or function type declaration; just notice that, for example, `String -> Bool -> Int` is always expanded as `lambda(left: type(String), right: lambda(left: type(Bool), right: type(Int)))`, so it is always a pair of types to be joined with `lambda`, never three types or more.
    * `left: TYPE`: what was on the left of the arrow operator;
    * `right: TYPE`: what was on the right of the arrow operator;
* `app`: it is when you write `Html a` or `List Int` or `Result MyOk MyErr` or `MyType MyAnotherType myvar` in a type definition, whenever you use a space to specify that one type relates to another in this particluar situation:
    * `subject: TYPE`: subject is a first item in this chain, so `type(Html)`, `type(List)`, `type(Result)` and `type(MyType)`, correspondingly;
    * `object: [ TYPE ]`: object is a list of the rest items in a chain: `[ var(a) ]`, `[ type(Int) ]`, `[ type(MyOk), type(MyErr) ]`, `[ type(MyAnotherType), var(myvar) ]` for the specified cases;
* `aliased`: it is usually only when you use `type alias` in your Elm code, so you give another name to some type, already defined somewhere; but there is one [Special Case](#message-variables) for that;
    * `def: DEFINITION`: the definition of an aliased type, no matter the internal one or the custom one:
        * `name: string`: could be `Int`, `String`, `List`, `Bool` or any name the person who created the code gave to this type;
        * `[user]: string`: if it's an user type or an external type, then it is a name of an user (or a type author) as defined in her `elm-package.json`;
        * `[package]: string`: if it's an user type or an external type, then it is a name of a package/project as defined in its `elm-package.json`;
        * `[path]: [string]`: if it's an user type or an external type, then it follows the list of modules and type names inside, defining the way to reach this particular type;
    * `list: [ TYPE ]`: a list of types associated with this alias;
    * `[msgvar]: string`: See [Special Cases / Message Variables](#message-variables);
    * `[msgnode]: TYPE`:  See [Special Cases / Message Variables](#message-variables);
* `record`: just a record as you know it, but with few important traits, see [Special Cases / Records](#records):
    * `fields: [ FIELD ]`: an array of record fields, name and type pairs:
        * `name: string`: name of the field;
        * `node: TYPE`: type of the field;

### Special cases

### Imports & Exports

If you call `new Repl(<options>).parseModule('Module')`, you'll not only get the types, but also imports and exports defined in this module.

Imports are just the array of paths to the imported things, in a way like:

```javascript
"imports": [{
        "path": ["Basics"]
    }, {
        "path": ["Debug"]
    }, {
        "path": ["Dict"]
    }, {
        "path": ["List"]
    }, {
        "path": ["Maybe"]
    }, {
        "path": ["Platform"]
    }, {
        "path": ["Platform", "Cmd"]
    }, {
        "path": ["Platform", "Sub"]
    }, {
        "path": ["Result"]
    }, {
        "path": ["String"]
    }, {
        "path": ["Tuple"]
    }]
```

There is a number of core imports which are always included in every module by default, but not listed there. Actually, for Elm 0.18 it is all of the listed above, except `Dict`.

Exports are somewhat a little bit more complicated.

```javascript
"exports": [{
        "type": "list",
        "path": [ "A" ]
    }, {
        "type": "nested",
        "name": "B",
        "values": [ "C", "D", "E" ]
    }, {
        "type": "single",
        "name": "F"
    }]
```

There are three types of export:

* `single`: just a name;
* `list`: this type of export could contain a path, but it may happen to have just one element there;
* `nested`: it is usually what you export, when you write, for example, `module MyModule exposing (B(..))` — so it is the export for union type where all the type variables for it are also exported;

#### Union type

Union types. If there is a union type defined in a program, then every option for it is defined as `type`. And the name of this type is referenced in the exports as a structure.

So, for example, for this type:

```elm
type Planet
  = Mercury
  | Venus
  | Earth
  | Mars
  | Jupiter
  | Saturn
  | Uranus
  | Neptune
```

Every its option (`Mercury`, `Venus`, `Earth`, ...) will be stored separately as:

```javascript
{ type: "type",
    def:
      { name: "Mercury",
        user: "user",
        package: "project",
        path: [ "Module" ],
        name: "Planet"
      } }
```

And the `Planet` type itself will be stored in exports as the enumeration:

```javascript
`Planet`: [ `Mercury`, `Venus`, `Earth` ... ]
```

#### Records

You may expect records to be stored just as a hash map with a relation of field name <-> type definition. It is close to the reality, but not entirely true. If the types of the record fields depend on some non-primitive types (and in this case, even `String` type is considered non-primitive), then, such record starts with a chain of lambdas, where _left part_ is referring to the required type and _the right part_ is either another `lambda` or an actual `record` with fields, and only when it happened to be the latter, you may treat is as the end of a chain.

So, for example, this record:

```elm
type alias O = { a: String, b: Int, c: Bool }
```

will be expanded into this creepy structure:

```javascript
{
    "name": "O",
    "value": {
      "type": "lambda",
      "left": {
        "type": "type", "def": { "name": "String" }
      },
      "right": {
        "type": "lambda",
        "left": {
          "type": "type", "def": { "name": "Int" }
        },
        "right": {
          "type": "lambda",
          "left": {
            "type": "type", "def": { "name": "Bool" }
          },
          "right": {
            "type": "aliased",
            "def": {
              "name": "O",
              "package": "project",
              "path": [
                "Module"
              ],
              "user": "user"
            },
            "list": [
              {
                "type": "record",
                "fields": [
                  {
                    "name": "a",
                    "node": {
                        "type": "type", "def": { "name": "String" }
                    }
                  },
                  {
                    "name": "b",
                    "node": {
                      "type": "type", "def": { "name": "Int" }
                    }
                  },
                  {
                    "name": "c",
                    "node": {
                      "type": "type", "def": { "name": "Bool" }
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    }
}
```

It is exactly the way it was stored in the interface file, just converted into JSON. But actually it provides you with the required info at every level of the deepness. But the `fields` object already stores the required information about types, and it actually does in 80% of cases. So, in most cases, you will be safe if you just skip all the `lambda`s on the way to the `fields` structure. Still, there are 20% of cases, when this won't be sufficient.

#### Message vars

TODO
