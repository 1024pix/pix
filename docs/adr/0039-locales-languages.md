# Logique et stratégie de gestion des paramètres régionaux et des langues (locales & languages)

Date : 2022-12-07


## État

En cours


## Contexte

L’*accueil multilingue/multi-locales du site https://pix.org/ (pix-site)* doit être retravaillé à l'occasion du lancement de l'utilisation de Pix par la FWB (Belgique).

C'est l'occasion de formaliser la logique et la stratégie de gestion des locales et des langues (locales & languages) dans Pix, qui semble-t-il ne l'est pas encore. C'est l'objet de cet ADR.

Comme il est question du code logiciel de Pix écrit en anglais, dans toute la suite du document on utilisera exclusivement les mots qui sont utilisés dans le code : *locale* et *language*.

### Rappel des précédents travaux i18n

Des travaux i18n ont été menés pendant les tech-days 2022.

### Définitions

Les paramètres régionaux, aussi appelés paramètres de lieu, environnement linguistique, options régionales et linguistiques, ou même culture ou locales (terme anglais), sont un ensemble de définitions de textes et de formats utiles à la régionalisation de logiciel. Ceux-ci permettent au logiciel d’afficher les données selon les attentes culturelles et linguistiques propres à la langue et au pays de l’utilisateur :

* le type de séparateur décimal
* la représentation des chiffres
* le format de la date et de l'heure
* les unités monétaires
* le codage par défaut des caractères
* l'ordre alphabétique des lettres (qui peut différer selon les régions)
* etc.

cf. [Paramètres régionaux, Wikipédia](https://fr.wikipedia.org/wiki/Param%C3%A8tres_r%C3%A9gionaux)

### Historique

Jusqu'aux environs de 2006, les locales, et les identifiants de locales, étaient gérées de manière spécifique suivant les différentes familles de systèmes (UNIX, Windows) et les différentes piles logicielles.
La date de 2006 est indicative, il faudrait une section dédiée pour donner les détails de l'histoire et ce n'est pas l'objet de ce document.

Parmi ces identifiants de locales spécifiques et historiques il y a les identifiants des *POSIX locales*, de la forme suivante :

`[language[_territory][.codeset][@modifier]]`.

Les identifiants de locales *POSIX locales* sont donc par exemple : `fr`, `fr_FR`, `fr_BE`, `fr_FR.UTF-8`, `en`, `en_GB`, `en_US`, et même `fr_FR@euro` pour un identifiant ancien datant du passage à l'euro

Ces identifiants de locales sont toujours utilisés par les systèmes POSIX comme les distributions Linux, et aussi par certains outils existants depuis longtemps comme [GNU gettext utilities](https://www.gnu.org/software/gettext/manual/html_node/Locale-Environment-Variables.html). La plateforme Java aussi (construit suivant la tradition UNIX, car créé par Sun Microsystems, entreprise qui concevait et vendait des machines de type UNIX) se basait sur ces identifiants, gérés au niveau de la classe `java.util.Locale`.
C'est pourquoi beaucoup peuvent se souvenir de l'utilisation de fichiers PO de la forme `fr_FR.po`, `en_US.po`, etc. et d'applications (notamment des applications Java multiplateformes) lancées en spécifiant `LC_ALL=fr_FR`, `LC_ALL=en_US`, etc.

Mais avec la généralisation d'Unicode sur quasiment tous les systèmes et toutes les piles logicielles il y a eu l'opportunité et la volonté de standardiser pour n'avoir qu'un seul format d'identifiants de locales.

La standardisation du format des identifiants de locales s'est faite dans la spécification [Tags for Identifying Languages (BCP 47 - RFC 5646)](https://www.rfc-editor.org/rfc/rfc5646.html), notamment autour de la notion de *language tags* définis . Il aurait peut-être été plus clair que ce mécanisme soit nommé *locale tags* … mais c'est le nom *language tags* qui a été retenu pour ce concept. Aussi pour éviter les confusions, dans le reste de ce document on va parler du *format BCP 47*.

Concrètement avant de donner plus d'informations sur le *format BCP 47*, pour se donner une idée de ce à quoi cela ressemble, voici des exemples d'identifiants de locales au *format BCP 47* : `fr`, `fr-FR`, `fr-BE`, `en`, `en-US`, `en-GB`

Le W3C définit le *format BCP 47* et les locales Unicode comme étant le format à utiliser par le web pour les identifiants de locales dans le document [Language Tags and Locale Identifiers for the World Wide Web](https://www.w3.org/TR/ltli/).

La plateforme Java, dans sa classe [`java.util.Locale`](https://docs.oracle.com/en/java/javase/19/docs/api/java.base/java/util/Locale.html) définit maintenant également le *format BCP 47* comme étant le format à utiliser pour les identifiants de locales, mais continue d'utiliser la forme POSIX pour sa méthode `toString` uniquement pour des raisons de compatibilité tout en dépréciant cette utilisation depuis *Java 19*.

Enfin, le langage JavaScript intègre le *format BCP 47* dans son coeur avec le namespace [`Intl`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) et notamment le builtin [`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale).

### Format BCP 47, identifiants de locales

La syntaxe des *languages tags* est puissante et extensible, pour les détails on se reportera aux spécifications citées.

On considérera initialement les identifiants de locales suivants pour pix. Cette liste qui correspond aux locales actuellement nécessaires pour pix a vocation à s'allonger :

* `fr`
* `fr-FR`
* `fr-BE`
* `en`

Et ce standard permet également de gérer des publics vivant dans une région mais ne maîtrisant pas la langue de la région, ou souhaitant utiliser une autre langue, par exemple :

* `en-FR`
* `en-BE`
 
[`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) est un builtin JavaScript qui permet de manipuler les locales comme suit :

```
> locale = new Intl.Locale("fr-FR")
> locale.toString()
'fr-FR'
> locale.language
'fr'
> locale.region
'FR'

> locale = new Intl.Locale("fr-BE")
> locale.toString()
'fr-BE'
> locale.language
'fr'
> locale.region
'BE'

> locale = new Intl.Locale("fr")
> locale.toString()
'fr'
> locale.language
'fr'
> locale.region
undefined

> locale = new Intl.Locale("en")
> locale.toString()
'en'
> locale.language
'en'
> locale.region
undefined
```

La spécification *BCP 47* accepte que la `region` soit écrite en minuscules, mais la forme canonique de la `region` est en majuscules. Le builtin `Intl.Locale` suit bien cette recommandation et on peut s'en rendre compte en instanciant un nouvel objet en utilisant un identifiant dans une forme non recommandée comme `fr-fr` qui sera transformée dans la forme canonique `fr-FR` :

```
> locale = new Intl.Locale("fr-fr")
> locale.toString()
'fr-FR'
> locale.language
'fr'
> locale.region
'FR'
```

#### Monnaie (currency)

Alors que par définition les paramètres régionaux contiennent la monnaie, le builtin [`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) ne contient rien sur le système de monnaie (currency) d'une région. A priori ce n'est pas un besoin pour Pix, mais on le mentionne ici car il faudrait creuser pour comprendre le pourquoi de cette exception, pour ne pas risquer de manquer des notions/détails potentiellement importants.

### État du code de Pix

Actuellement dans le code de pix les 2 notions et noms de *locale* et *language* sont manipulés :

* la notion et le nom de *language* sont utilisés pour le côté client
* la notion et le nom de *locale* sont utilisés côté BDD et hapi

En ce qui concerne le format des identifiants de *language*/*locale*, c'est le format suivant qui est utilisé dans le code de pix : `fr`, `fr-fr`, `fr-be`. Ce format n'est pas la forme canonique de représentation tel que défini par la spécification *BCP 47* (car la partie `region` devrait être en majuscules), mais c'est une forme acceptée et par spécification c'est compatible avec `Intl.Locale`.


## Solution proposée : Fonder tous les traitements sur la notion de locales

**Description**

Dans le cas de Pix c'est la notion de *locale* qui est la plus importante car une *locale* est une association langue + autres données liées au groupe auquel on s'adresse, ce qui correspond bien aux cas d'utilisation de Pix où chaque utilisateur fait partie d'un groupe linguistique-géolocalisé, même si la géolocalisation de ce groupe peut parfois être très large.

On souhaite donc :

* associer à chaque utilisateur une *locale* (et non plus un *language*) au format BCP 47 avec persistance de ce choix en base de données
* avoir les différentes versions des sites web identifiées par une *locale* au format BCP 47 (`fr`, `fr-FR`, `fr-BE`, `en`) et non plus des identifiants non-canoniques (`fr`, `fr-fr`, `fr-be`, `en` ont la partie `region` en minuscules)
* utiliser le builtin JavaScript [`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) chaque fois que c'est possible

**Avantage(s) :**

- Traiter systématiquement des *locales* est une recommandation facile à comprendre et à suivre
- Le builtin JavaScript `Intl.Locale` est un outil disponible. Même si `Intl.Locale` n'est pas disponible sur tous les navigateurs on pourrait ne l'utiliser d'abord que côté serveur et utiliser sa forme sérialisée par la méthode `toString` partout ailleurs.

**Inconvénient(s) :**

- Actuellement la table `users` a une colonne `lang` et non `locale`, ce qui demanderait du travail de migration de données et de code si on veut passer à `locale`

## Décision

* Recueillir les avis et commentaires de tous les développeurs Pix. Ces avis et commentaires, s'il y en a, seront à centraliser dans un ticket Jira à créer et qui sera indépendant de la PR qui a servi à créer cet ADR.
* Mettre en oeuvre cet ADR dans *pix-site*, le faire évoluer si besoin en fonction de l'expérience acquise

   Concrètement :

   * On ne change pas l'identifiant de la locale `fr` déjà existant car c'est un identifiant de locale valide. Cette locale propose une version internationale sans cibler une région particulière.
   * On changera l'identifiant `fr-fr`, qui n'est pas un identifiant recommandé (car la région doit être en majuscules), en `fr-FR`.
   * On changera `en-us` et `en-gb`, qui ne sont pas des identifiants recommandés (car la région doit être en majuscules), en simplement `en` car on souhaite proposer une version en anglais de manière internationale, sans cibler cette version pour une région particulière.
   * On changera les potentiels noms de propriétés et noms de colonnes qui seraient nommés `language` ou `lang` pour les nommer `locale`

   Cela ne devrait pas faire beaucoup de changements et cela devrait être des changements simples. C'est surtout que cela permettra de normer tout ce qu'on fait et de ne pas être dans l'arbitraire toujours à se demander quel nom donner à une variable et quelle valeur mettre dans cette variable.

* Enfin, une fois que cet ADR aura été utilisé sur *pix-site*, un point d'étape sera fait, avec d'éventuelles modifications. On lui retirera alors son statut *En cours* avant de le mettre en oeuvre dans tout le code de pix.
