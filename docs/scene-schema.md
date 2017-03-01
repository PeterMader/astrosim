## AstroSim scenes
AstroSim scenes are stored as JSON objects. An AstroSim scene must fulfill these conditions:
* It must be valid [JSON](http://json.org).
* It must have a main object.
* The main object must have a `meta` field, a `viewport` field, and a `content` field, all of which have the type `object`.
* The `meta` field must have a `name` field and a `description` field, all of which have the type `string`.
* The `viewport` field must have a `translationX` field, a `translationY` field, all of which have the type `number`, as well as a `ratio` field, whose type is `number` and which is positive.
* The `content` field must have
  * a `selectedObjectIndices` field of type `array`, whose contents are of type `number`,
  * a `timeFactor` field of type `number` and
  * an `objects` field of type array, whose contents are of type `object` and have
    * a `name` field of type `string`,
    * a `positionX` field, a `positionY` field, a `velocityX` field and a `velocityY` field, all of which have the type `number`,
    * a `mass` field and a `radius` field, all of which have the type `number` and are positive and
    * a `color` field of type `string` and match the following regular expression: `^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`
