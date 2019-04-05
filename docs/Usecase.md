# Usecase

## Définition

Un usecase:
 - est une fonction
 - [utilise le pattern RORO](https://medium.freecodecamp.org/elegant-patterns-in-modern-javascript-roro-be01e7669cbd)
 - require seulement des éléments venant du domaine
 - récupèrent leurs dépendances vers l'extérieur en tant que paramètres donnée à la fonction

```javascript
// BAD
const myRepository = require(../../../infrastructure/repositories/myRepository);

// GOOD
const myService = require(../../../domain/services/myService);

module.exports = function myUseCase({ param1, param2, param3, repo1, repo2 }) {
...
}
```

## Controllers

Un controlleur ne peux __pas__ appeler __2__ usecases séquentiellement.

