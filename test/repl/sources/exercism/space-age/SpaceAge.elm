module SpaceAge exposing (..)

type Planet
  = Mercury
  | Venus
  | Earth
  | Mars
  | Jupiter
  | Saturn
  | Uranus
  | Neptune

earthPeriod : Float
earthPeriod = 31557600

ageByOrbitalPeriod : Float -> Float -> Float
ageByOrbitalPeriod age period =
    age / (earthPeriod * period)

ageOn : Planet -> Float -> Float
ageOn planet age =
    case planet of
        Earth   -> ageByOrbitalPeriod age 1
        Mercury -> ageByOrbitalPeriod age 0.2408467
        Venus   -> ageByOrbitalPeriod age 0.61519726
        Mars    -> ageByOrbitalPeriod age 1.8808158
        Jupiter -> ageByOrbitalPeriod age 11.862615
        Saturn  -> ageByOrbitalPeriod age 29.447498
        Uranus  -> ageByOrbitalPeriod age 84.016846
        Neptune -> ageByOrbitalPeriod age 164.79132
