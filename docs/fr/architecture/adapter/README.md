# Adapter

Un adapter est le code au bord du domaine. Il fait le lien entre le domaine et le monde extérieur :
une requête HTTP, la base de données, un autre contexte, une file de jobs. Son rôle est de traduire,
dans un sens ou dans l'autre. Il ne décide rien : les règles du métier restent dans le domaine.

Plusieurs fiches décrivent un adapter : le contrôleur, l'API interne, le repository. Elles ne
réexpliquent pas ce qu'est un adapter, elles renvoient ici.

## Entrée ou sortie : qui a commencé ?

Un adapter est en entrée ou en sortie. Ce n'est pas le sens des données qui compte, puisque les
données vont presque toujours dans les deux sens. C'est qui lance l'appel.

- **En entrée** : l'extérieur appelle notre code. Une requête HTTP arrive, un autre contexte appelle
  notre API interne, un événement est reçu. L'adapter traduit la demande, puis appelle un usecase.
- **En sortie** : notre usecase a besoin de l'extérieur. Il appelle l'adapter, qui traduit vers la
  base de données ou vers un autre contexte, puis traduit la réponse en objets du domaine.

Par exemple, un repository lit des données, mais c'est le usecase qui l'appelle : c'est un adapter en
sortie.

## L'adapter et ses aides

Un adapter se fait souvent aider par des traducteurs. Le contrôleur se sert du sérialiseur pour
passer du JSON:API aux objets du domaine. Le repository se sert de fonctions comme `toDomain` et
`toRow`. Un traducteur traduit des données, et c'est tout : il ne décide rien et n'appelle personne.
C'est l'adapter qui reçoit l'appel ou qui le fait.

## Les adapters de Pix

| Adapter | Sens | Ses aides |
| --- | --- | --- |
| [contrôleur](../controller/README.md) | entrée, depuis HTTP | la [route](../route/README.md), qui déclare l'URL, la validation et les droits ; le [sérialiseur](../serializer/README.md), qui traduit le JSON:API |
| [API interne](../internal-api/README.md) | entrée, depuis un autre contexte | le DTO, ce que l'API renvoie |
| handler d'événement | entrée, depuis un événement | la lecture du contenu de l'événement |
| [repository](../repository/README.md) | sortie, vers la base de données | `toDomain` et `toRow`, qui traduisent les lignes de la base |
| repository qui lit l'API interne d'un autre contexte | sortie, vers un autre contexte | la traduction du DTO reçu en objets de notre domaine |
| adapter vers un autre contexte, dans `infrastructure/adapters/` | sortie, vers un autre contexte | aucune, quand il transmet l'appel tel quel |

## À savoir

- La traduction entre deux contextes porte un nom en DDD : l'Anticorruption Layer. Elle empêche le
  modèle d'un autre contexte d'entrer dans le nôtre. Dans Pix, c'est le repository ou l'adapter en
  sortie qui la fait.
- Le nom vient de l'architecture hexagonale, aussi appelée « ports et adapters » : le domaine déclare
  ce dont il a besoin, un port, et un adapter le fournit.
