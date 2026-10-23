# Adapter

Un adapter relie le domaine au monde extérieur. Le monde extérieur, c'est par exemple une requête
HTTP, la base de données, un autre contexte ou la file de jobs. Un contexte est un dossier de `src/`
qui a son propre modèle, comme prescription ou organizational-entities. Le rôle de l'adapter est de
traduire, dans un sens ou dans l'autre. Il ne décide rien : les règles du métier restent dans le
domaine.

Plusieurs fiches décrivent un adapter : le contrôleur, l'API interne, le repository. Elles ne
réexpliquent pas ce qu'est un adapter, elles renvoient ici.

## Entrée ou sortie : qui lance l'appel

Un adapter est en entrée ou en sortie, selon qui lance l'appel. Les données, elles, vont presque
toujours dans les deux sens.

- **En entrée** : l'extérieur appelle le code du contexte. Une requête HTTP arrive, un autre contexte
  appelle son API interne, un job démarre. L'adapter traduit la demande, puis appelle un
  [usecase](../usecase/README.md), le code qui mène une action du métier.
- **En sortie** : un usecase a besoin de l'extérieur. Il appelle l'adapter, qui traduit vers la base de
  données ou vers un autre contexte, puis traduit la réponse en objets du domaine.

Par exemple, un repository lit des données, mais c'est le usecase qui l'appelle. C'est donc un adapter
en sortie.

## L'adapter et ses traducteurs

Un adapter se fait souvent aider par des traducteurs. Le contrôleur se sert du sérialiseur, qui passe
du JSON:API aux objets du domaine, et des objets du domaine au JSON:API. Le repository se sert de
fonctions comme `toDomain`. Un traducteur convertit des données. Il n'appelle ni usecase, ni base de
données, ni autre contexte : c'est l'adapter qui reçoit l'appel ou qui le fait.

## Les adapters de Pix

| Adapter | Sens | Ses traducteurs |
| --- | --- | --- |
| [contrôleur](../controller/README.md) | entrée, depuis HTTP | le [sérialiseur](../serializer/README.md) |
| [API interne](../internal-api/README.md) | entrée, depuis un autre contexte | aucun : l'API construit elle-même le DTO, l'objet qu'elle renvoie |
| contrôleur de job, dont le handler d'événement | entrée, depuis la file de jobs | la lecture du contenu du job |
| [repository](../repository/README.md) | sortie, vers la base de données | des fonctions comme `toDomain`, décrites dans la fiche Repository |
| repository qui lit l'API interne d'un autre contexte | sortie, vers un autre contexte | la traduction du DTO reçu en objets du domaine du contexte |
| adapter qui demande une action à un autre contexte | sortie, vers un autre contexte | la traduction de la demande en appel de l'API interne de l'autre contexte |

La [route](../route/README.md) n'est pas un traducteur. Elle branche le contrôleur sur le serveur, et
déclare la forme des entrées et les droits : voir sa fiche.

## À savoir

- La traduction entre deux contextes porte un nom en DDD : l'Anticorruption Layer. Grâce à elle, les
  objets du domaine d'un contexte ne reprennent ni les noms ni la forme du DTO d'un autre contexte.
  C'est l'adapter en sortie qui la fait, qu'il s'agisse d'un repository ou d'un autre adapter.
- Le nom vient de l'architecture hexagonale, aussi appelée « ports et adapters ». En sortie, le domaine
  déclare ce dont il a besoin dans une interface, appelée port. Un adapter fournit ce port.
