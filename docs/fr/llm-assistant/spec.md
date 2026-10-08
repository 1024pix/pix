Status: ready-for-agent

# Spec — Assistant d'attachement de profils cibles aux organisations

Le premier cas d'usage retenu pour l'assistant est l'attachement et le détachement
de profils cibles aux organisations. Ce n'est pas la création d'organisations en
masse, qui a servi de terrain au POC.

**Ce document couvre** le périmètre du premier jalon, son découpage en verticales
livrables, les décisions d'architecture et les coutures de test.

**Il ne couvre pas** l'ouverture de l'outil au-delà d'un utilisateur de test, ni
l'ouverture du serveur MCP aux partenaires. Ce qui en relève est listé en *Out of
Scope*, avec la condition qui le rendra exigible.

Le jalon visé est le moment où un premier utilisateur de test peut se servir de
l'outil et dire ce qu'il en pense.

## Problem Statement

Les équipes métier détiennent les règles d'attribution des profils cibles aux
organisations — quels profils pour quelles organisations — formalisées dans leurs
propres fichiers, avec leur propre vocabulaire, et négociées avec leurs
partenaires.

Pour appliquer ces règles, il faut aujourd'hui passer par Pix Admin organisation
par organisation, ou solliciter un super admin. Avec environ **1500 profils
cibles** en base, l'appariement entre ce que dit une règle et ce qui existe
réellement est long, répétitif, et sujet à erreur — d'autant que beaucoup de
profils portent des noms voisins.

Le travail d'appariement est aussi, incidemment, le seul moment où quelqu'un
vérifie la cohérence de ce qui est demandé. Et ce qu'il vérifie se range en deux
familles que l'automatisation traite différemment.

**La politique d'attribution** — quels profils pour quelles organisations — ne peut
pas entrer dans le système : elle est propre à chaque verticale partenaire,
maintenue par les équipes dans leurs fichiers, et évolutive. C'est justement
pourquoi ces fichiers sont fournis à l'assistant plutôt que traduits en code. Rien
ne la protégera donc jamais, sinon la relecture humaine de ce qui est proposé.

**L'intégrité structurelle**, elle, devrait être dans le système et n'y est pas :
le chemin d'attachement n'a aucune entité de domaine, et le modèle qui porte le
détachement n'oppose aucun refus. Automatiser en l'état, c'est retirer de la boucle
la seule vérification qui existe, sans rien mettre à la place.

## Solution

**Écrire dans le domaine ce que l'opérateur vérifiait de tête**, et rendre
traçable toute opération faite par un outil.

L'API devient le point d'étranglement : elle refuse les attachements qui n'ont pas
de sens métier, quelle que soit la porte d'entrée, et elle enregistre qui a fait
quoi et par quel moyen.

Une fois ce socle posé, l'assistant conversationnel peut être construit et itéré
librement côté Pix Admin. Le métier lui fournit ses fichiers de règles, lui demande
de les appliquer, examine ce qui est proposé, et déclenche lui-même l'exécution.
La pire défaillance de l'assistant produit alors des attachements valides mais non
désirés — **réversibles par détachement**, et retrouvables par le journal.

## User Stories

Les récits ci-dessous couvrent l'ambition complète. Le MVP sert directement 1 à 11
et 19 à 22 ; les autres sont servis par les itérations décrites plus bas.

1. En tant que responsable de la donnée, je veux que le domaine refuse les attachements qui n'ont pas de sens métier, afin qu'aucune automatisation ne produise d'incohérences à l'échelle.
2. En tant que responsable de la donnée, je veux que ces règles s'appliquent quelle que soit la porte d'entrée, afin que Pix Admin et l'assistant ne puissent pas diverger.
3. En tant que responsable de la donnée, je veux que les règles soient énoncées à partir de la pratique métier existante, afin de ne pas inventer des contraintes que personne n'applique.
4. En tant que responsable de la donnée, je veux savoir combien d'attachements existants violent une règle avant qu'elle ne devienne exigible, afin de dimensionner le rattrapage.
5. En tant que responsable de la donnée, je veux que le rattrapage précède la mise en application, afin de ne pas rendre illisibles des données existantes.
6. En tant qu'utilisateur de Pix Admin, je veux être arrêté quand je demande un attachement impossible, afin de ne pas créer une situation qu'il faudra défaire.
7. En tant qu'appelant de l'API, je veux qu'une opération d'attachement puisse être demandée à blanc, afin de savoir ce qui changerait sans rien écrire.
8. En tant qu'appelant de l'API, je veux que l'essai à blanc soit le comportement par défaut, afin qu'un oubli ne modifie jamais rien.
9. En tant qu'appelant de l'API, je veux que l'essai à blanc applique les mêmes règles que l'opération réelle, afin que son résultat soit digne de confiance.
10. En tant qu'appelant de l'API, je veux qu'un profil cible introuvable me renvoie les correspondances les plus proches, afin de pouvoir lever l'ambiguïté sans énumérer 1500 entrées.
11. En tant qu'appelant de l'API, je veux qu'un attachement déjà existant soit traité sans créer de doublon, afin qu'une exécution répétée reste sans effet.
12. En tant que membre d'une équipe métier, je veux fournir mes propres fichiers de règles dans leur format d'origine, afin de ne pas avoir à les retraduire.
13. En tant que membre d'une équipe métier, je veux que l'assistant me montre quel profil cible exact il a identifié — identifiant et nom complet — afin de détecter une résolution erronée avant qu'elle ne s'applique.
14. En tant que membre d'une équipe métier, je veux voir l'état d'une organisation avant et après, afin de juger ce qui va réellement changer.
15. En tant que membre d'une équipe métier, je veux corriger et re-simuler autant de fois que nécessaire, afin d'atteindre un résultat conforme à mes règles.
16. En tant que membre d'une équipe métier, je veux déclencher l'exécution moi-même, afin que rien ne soit modifié sans que je l'aie voulu.
17. En tant que membre d'une équipe métier, je veux pouvoir recopier les profils d'une organisation vers une autre, afin d'appliquer une règle d'alignement sans ressaisie.
18. En tant que membre d'une équipe métier, je veux être autonome sur l'opération complète, afin de ne plus dépendre de la disponibilité d'un super admin.
19. En tant qu'auditeur, je veux savoir qui a attaché ou détaché un profil cible, afin d'identifier la personne responsable de l'opération.
20. En tant qu'auditeur, je veux savoir si l'opération a été faite par un outil ou depuis Pix Admin, afin de distinguer les modes d'obtention.
21. En tant qu'auditeur, je veux retrouver toutes les opérations issues d'un même lot, afin de défaire une erreur systématique sans rapprocher un fichier à la main.
22. En tant qu'auditeur, je veux que le journal soit écrit au fil de l'exécution, afin qu'un lot interrompu reste diagnosticable.
23. En tant que membre de l'équipe d'exploitation, je veux pouvoir débrancher la fonctionnalité sans livraison, afin d'arrêter l'hémorragie en cas d'incident.
24. En tant que membre de l'équipe d'exploitation, je veux mesurer la consommation du modèle, afin de détecter une dérive avant qu'elle ne coûte cher.
25. En tant que développeur, je veux que les règles soient testables sans base, sans navigateur et sans modèle, afin de pouvoir reprendre le chantier après un mois d'interruption.
26. En tant que CTO, je veux que les outils du backoffice soient exposés via MCP, afin de préparer une ouverture ultérieure à nos partenaires.

## Implementation Decisions

### Nature du chantier

**Le POC est du code jetable.** La production se construit à neuf, sur des
branches issues de `dev`. La branche du POC n'est ni rebasée ni fusionnée : elle
sert de référence et de source d'enseignements, et son retard de 254 commits cesse
d'être un sujet.

Les défauts relevés dans le POC ne sont pas une dette à rembourser, ce sont des
résultats d'exploration. On ne les reproduit pas.

### Contexte borné

Le chantier touche trois emplacements, qu'il faut distinguer : le **serveur MCP et
le journal** vivent dans un contexte borné dédié à l'assistant, restant à nommer ;
les **invariants d'attachement** vivent dans le contexte des profils cibles de
prescription ; les **lectures** traversent les contextes via des read-models, celle
d'une organisation s'appuyant sur les entités organisationnelles.

Les quatre opérations visées par le métier sont **déjà réalisables** :

| Opération | Réalisation |
|---|---|
| Attacher un profil à une organisation | usecase d'attachement existant, appelé avec un identifiant |
| Attacher plusieurs profils à une organisation | le même — il prend déjà N profils pour une organisation |
| Détacher N profils d'une organisation | usecase de détachement existant, mais écrit dans l'autre sens : il prend N **organisations** pour **un** profil. Détacher N profils impose donc N appels, dont l'atomicité est à décider. |
| Recopier tous les profils d'une organisation vers une autre | **composition** : lire les profils attachés à la première, les attacher à la seconde |

**Aucun cas d'usage d'écriture nouveau n'est requis.** La quatrième opération se
compose des autres : c'est l'assistant qui compose, pas l'API qui expose une
opération de plus.

En revanche, l'intégrité structurelle suppose de **créer l'entité qui manque sur le
chemin d'attachement** et d'y faire passer le usecase existant — ce qui touche
aussi la route Pix Admin qui l'emprunte. « Aucune opération nouvelle » ne veut donc
pas dire « aucun code de domaine à écrire ».

### Le constat qui fonde le MVP

L'état du domaine diffère selon la direction, et il faut le dire précisément.

- Sur le chemin d'**attachement de profils cibles à une organisation** — le cas
  d'usage central — il n'y a **aucune entité** : le usecase va directement au
  repository. Il ne s'agit donc pas d'enrichir un modèle anémique, mais d'en
  **créer un** et d'y faire passer le usecase existant.
- Le modèle qui porte le **rattachement d'organisations** existe et **refuse
  déjà** sur liste vide. Il ne part pas de rien.
- Le modèle qui porte le **détachement** est anémique : un constructeur qui retient
  un identifiant, une méthode qui déduplique une liste, aucun refus possible.

La fiche entité du corpus d'architecture nomme le manque le plus fréquent : une
méthode de changement d'état doit être testée sur le cas passant **et** sur le
refus. C'est ce que ce chantier corrige — mais la création de l'entité manquante en
fait un travail plus substantiel qu'un simple ajout de règles.

### Périmètre du MVP

Le MVP est atteint quand un premier utilisateur de test peut se servir de l'outil
et dire ce qu'il en pense. Un socle que personne n'a utilisé repose sur des
suppositions.

Il se découpe en quatre verticales. Chacune traverse toutes les couches, se livre
derrière le même drapeau, et produit du retour par elle-même.

| | Verticale | Ce que l'utilisateur peut faire | Ce que la verticale fait apprendre |
|---|---|---|---|
| V1 | Parler | tenir une conversation dans Pix Admin, sans aucun outil | le modèle est-il utile sur ce domaine, à quelle latence |
| V2 | Lire | demander ce qui est attaché à une organisation, chercher un profil | la résolution parmi 1500 profils aux noms voisins |
| V3 | Écrire | attacher et détacher, une opération à la fois | la boucle essai à blanc puis confirmation est-elle comprise |
| V4 | Le fichier et le script | déposer ses règles et les appliquer en lot | la valeur réelle de l'outil |

Un prérequis conditionne V1 sans constituer une verticale : restreindre l'accès aux
utilisateurs du test. Sans lui, tous les administrateurs voient l'outil et le test
cesse d'être accompagné.

Cet ordre isole le blocage. V4 est la seule verticale qui dépende de la politique
de sécurité de contenu, dont la modification n'appartient pas à l'équipe. V1 à V3
avancent quelle que soit l'issue de cette demande.

V4 porte la valeur. Sans dépôt de fichier ni exécution en lot, l'assistant demande
plus de clics et plus d'attente que l'écran Pix Admin existant, pour le même
résultat. Les trois premières verticales produisent malgré tout du retour, et elles
répondent à des questions sur lesquelles ce document ne fait que spéculer.

### Risque résiduel assumé

Un outil peut produire des attachements valides mais non désirés, par exemple si un
modèle déclenche une exécution que personne n'a confirmée. Les règles métier restent
respectées : ce n'est pas de la corruption de données.

Le journal est reporté. À l'échelle d'un utilisateur de test unique et accompagné,
trois choses le remplacent.

1. L'opération se défait par un détachement.
2. Le fichier de règles est lui-même l'enregistrement. Le rejouer en mode
   détachement annule le lot.
3. La conversation garde le fil de ce qui a été demandé, tant que la page n'est
   pas rechargée. Le serveur ne conserve aucune conversation.

Les deux premiers substituts portent l'arbitrage. Le troisième disparaît au
premier rechargement de page, et ne doit pas être compté dessus.

Ces trois substituts cessent de tenir dès le **deuxième utilisateur**, ou dès que
l'usage n'est plus accompagné. Le journal redevient exigible à ce moment, pas à la
mise en production.

La réversibilité est une hypothèse de travail, pas un acquis, et elle porte seule
l'arbitrage ci-dessus. Deux réserves restent ouvertes pendant tout le MVP, puisque
le ticket d'intégrité structurelle est lui aussi reporté.

- Certains attachements sont peut-être irrévocables, par exemple si des campagnes
  en dépendent. Personne ne l'a vérifié. Si c'est le cas, l'arbitrage est à rouvrir.
- Le détachement supprime le lien. Ré-attacher rétablit l'effet, pas l'identité ni
  la date d'origine du lien supprimé.

La première réserve se lève par une question à l'équipe responsable des profils
cibles. Elle ne demande aucun code et conditionne la sûreté du MVP.

### Le risque principal n'est pas l'écriture, c'est la résolution

Avec environ 1500 profils cibles aux noms souvent voisins, l'erreur la plus
probable n'est pas une violation d'intégrité structurelle — celle-là, les
invariants la refuseront — mais un attachement **structurellement valide sur le
mauvais profil**. Toute la chaîne fonctionnera alors sans broncher : intégrité
respectée, opération licite, journal correct, résultat faux.

Deux conséquences :

- **Les outils résolvent et vérifient, ils n'énumèrent jamais.** Aucun outil ne
  peut répondre par une liste de 1500 entrées. La recherche est filtrée et
  paginée.
- **Toute présentation d'une opération doit désigner le profil sans ambiguïté** —
  identifiant, nom complet, état — et non un simple décompte. C'est le seul
  endroit où cette erreur est rattrapable.

### Surface d'outils : lectures génériques, écritures spécifiques

**Trois outils**, et ce nombre ne doit pas croître avec le périmètre couvert.

| Outil | Nature | Forme |
|---|---|---|
| `read` | lecture | une adresse, résolue par un routeur de schémas |
| Attacher N profils cibles à une organisation | écriture | schéma typé |
| Détacher N profils cibles d'une organisation | écriture | schéma typé |

L'asymétrie est délibérée. Une **écriture** a besoin d'un schéma typé : c'est lui
qui permet de valider, de refuser, et de dire au modèle ce qu'il a le droit de
demander. Une **lecture** est de la navigation : elle a besoin d'une adresse, pas
d'un schéma par entité.

**Le motif d'adressage.** Une lecture est désignée par une adresse à schéma, qu'un
routeur résout. Lire une collection est lire une adresse : il n'y a pas d'outil de
recherche séparé.

```
organisations://<id>                     la fiche, profils attachés compris
profils-cibles://<id>                    un profil précis
profils-cibles://?nom=<terme>:1-20       une page de résultats filtrés
```

La pagination et le découpage vivent **dans l'adresse**, sous forme de sélecteur
terminal, et non en paramètres d'outil. C'est ce qui permet d'interdire
structurellement l'énumération : une collection sans plage est paginée par défaut,
avec un décompte total.

**La propriété recherchée** : couvrir une entité de plus — campagnes, utilisateurs,
centres de certification — ajoute **un schéma, pas un outil**. Le catalogue reste
à trois entrées quel que soit le périmètre. C'est la réponse au foisonnement
d'outils qu'un backoffice aussi large que Pix Admin provoquerait autrement, et
c'est l'application à la surface d'outils de l'objectif « ne plus développer au
coup par coup ».

La contrepartie, à tenir : **les lectures sont gratuites en surface, les écritures
sont comptées.** Un outil d'écriture de plus est une décision, pas un réflexe, et
la première question à lui poser est « est-ce que ça ne se compose pas à partir de
celles qui existent ? » — c'est elle qui a éliminé la recopie d'une organisation
vers une autre.

**Deux exigences de robustesse**, parce qu'une adresse est du texte libre là où un
schéma typé guide le modèle :

- La grammaire reste **délibérément pauvre** — un schéma, un identifiant ou un
  filtre, une plage. Rien de plus tant qu'un besoin réel ne l'impose.
- Une adresse invalide répond par **les schémas disponibles et un exemple**, pas
  par une erreur sèche : l'outil se documente lui-même au tour suivant.

La fiche d'organisation reste un **read-model** au sens du corpus d'architecture —
une organisation et ses profils attachés, assemblés pour un consommateur, sans
être une entité du domaine. Elle change d'adresse, pas de nature. Elle sert aussi
d'avant et d'après à la simulation : le diff de deux fiches suffit à montrer ce qui
changerait, sans format dédié.

**Antériorité.** Le motif est repris de `oh-my-pi`, dont l'outil `read` absorbe
fichiers, archives, bases, ressources internes et URL derrière un unique paramètre
`path`, avec un routeur de schémas auquel un serveur MCP peut ajouter les siens.
Pix n'a pas de convention établie sur ce point : `pix-mcps` n'expose aujourd'hui
que des outils spécifiques et n'enregistre aucune ressource. Cette spec établit
donc la convention plutôt qu'elle n'en suit une.

### Invariants métier

La distinction structurante est entre **validation d'entrée** — un champ pris
isolément, forme et format — et **invariant métier** — ce qui doit rester vrai
entre plusieurs champs ou plusieurs entités. La première peut légitimement être
répétée à chaque porte d'entrée ; le second n'a qu'un emplacement, le domaine.

- Les invariants portant sur la légitimité d'un attachement relèvent de
  l'**entité**, vérifiés à la construction et à chaque méthode de changement
  d'état, qui doit pouvoir **refuser**.
- Les invariants nécessitant l'état de la base — un attachement déjà existant, un
  profil obsolète — sont vérifiés dans le **usecase**.

**Conséquence de séquencement.** Une validation à la construction fait échouer la
*lecture* d'une donnée non conforme, pas seulement son écriture. Le rattrapage
doit donc précéder la mise en application d'un invariant, jamais la suivre. Ordre
imposé, pour chaque règle : mesurer, corriger, activer.

**Il n'existe pas de règles d'attribution générales, et il ne faut pas en
chercher.** La politique — quels profils cibles pour quelles organisations — est
propre à chaque verticale partenaire, maintenue par les équipes métier dans leurs
propres fichiers, et évolutive. C'est exactement pour cela que ces fichiers sont
fournis à l'assistant plutôt que traduits en code.

Ne relève donc du domaine que l'**intégrité structurelle** : attacher deux fois le
même profil, attacher un profil obsolète, détacher sans vérification. Ce sont des
vérités Pix, indépendantes des partenaires et des fichiers.

**Conséquence à assumer.** Le domaine ne peut pas rattraper un attachement
*licite mais faux* — mauvaise politique, ou mauvaise résolution parmi 1500 profils
aux noms voisins. L'argument « tant que l'API empêche les bêtises, le reste est de
l'ergonomie » ne vaut donc que pour les incohérences structurelles. Contre la
classe d'erreur dominante, il ne reste que la revue humaine, la **réversibilité**
du détachement, et le **journal** pour savoir quoi défaire. C'est ce qui rend ces
deux derniers non négociables.

### Journal

Une table propre au contexte borné de l'assistant, enregistrant l'utilisateur, le
moyen d'obtention et un identifiant de lot.

**Écrite au fil de l'exécution**, jamais à la fin : un lot interrompu doit rester
diagnosticable.

Pix Audit Logs n'est pas retenu : son modèle est centré sur des actions visant des
personnes et son objet est le suivi RGPD.

### Contrat de l'opération d'écriture

- **Le mode est explicite, et son absence vaut essai à blanc.** L'écriture réelle
  ne peut jamais résulter d'un oubli. Le POC faisait l'inverse — le mode
  destructeur s'obtenait en omettant le drapeau — et c'est la correction
  obligatoire de son contrat.
- **L'essai à blanc applique exactement les mêmes règles que l'opération réelle.**
  C'est ce qui lui donne sa valeur : il devient un essai des vrais invariants.
- Une réponse d'erreur **nomme les identifiants reçus qui n'existent pas**. Les
  outils d'écriture prennent des identifiants techniques : il n'y a pas de
  correspondance approchante d'un entier inconnu. La proximité relève de la
  **recherche**, où elle est effectivement du chemin critique — c'est là, et non
  ici, que se joue la levée d'ambiguïté entre 1500 profils aux noms voisins.

### Décisions déjà prises

Tranché pendant le cadrage, à reprendre sans réinstruction.

Quatre de ces décisions sont **dans le périmètre du MVP** et portées par les
verticales : la nature des documents fournis et l'exécution des scripts par V4,
l'assentiment et le lot par V3 et V4, les habilitations par V1. Les suivantes
restent hors périmètre : le déploiement du serveur MCP, l'exploitation, et la
décision écartée après examen.

**Nature des documents fournis.** Le métier ne dépose pas des données à
transcrire, il dépose **ses règles** — quels profils pour quelles organisations —
dans ses propres fichiers, et demande leur application. Le contenu des documents
est donc, par conception, une instruction que l'assistant suit. Il n'y a aucune
frontière à défendre entre donnée et instruction : **la seule chose qu'un document
ne peut pas faire changer d'avis est le domaine.** C'est ce qui justifie que
l'intégralité de la protection soit côté API.

**Exécution des scripts.** Aucun code généré par un modèle ne s'exécute côté
serveur : l'exécution a lieu dans le bac à sable du navigateur, via un worker web
chargé depuis une ressource servie par l'origine. Le worker n'a pas accès au
stockage local, donc au jeton de session. Tous les appels d'outils sont médiés par
la page hôte. Un plafond d'appels et une interruption effective sur délai dépassé
sont requis. Ce n'est pas une protection en plus : c'est moins de code que
l'exécution serveur qu'elle remplace.

**Assentiment.** L'appelant choisit le mode de l'outil, jamais le script : la page
hôte impose l'essai à blanc tant que l'utilisateur n'a pas cliqué, et la boucle
d'exécution déclenchée par le bouton est le seul endroit qui demande l'opération
réelle. Un modèle peut demander l'outil autant qu'il veut, il ne décide pas du
mode.

**Lot.** Indivisible : pas d'exclusion, l'objectif de l'utilisateur étant que
l'intégralité de ses règles s'applique. La recevabilité — aucune opération en
erreur — conditionne l'activation du bouton, qui reste visible et désactivé avec
la raison du blocage.

**Déploiement du serveur MCP.** Application Scalingo séparée, et non type de
conteneur : un type de conteneur ne reçoit aucun trafic entrant, et l'ouverture
ultérieure aux partenaires suppose une URL publique et un modèle
d'authentification propre. Le registre de sessions devra fonctionner sur plusieurs
conteneurs. Rien de tout cela n'est requis tant qu'il n'y a pas de partenaire.

**Habilitations.** Les trois rôles disposant de l'accès au périmètre admin
conservent l'accès complet, exécution comprise. Restreindre l'exécution à un rôle
supérieur reconstruirait l'aller-retour que le projet supprime.

**Exploitation.** Interrupteur permettant de débrancher la fonctionnalité sans
livraison, via le mécanisme de bascule existant. Mesure de la consommation du
modèle — l'outillage de télémétrie est déjà présent dans le POC mais désactivé.
Aucun bridage de débit en première version.

**Le modèle n'est pas arrêté.** Celui du POC est un banc d'essai ; monter en
gamme reste ouvert. Aucune décision de conception ne doit donc être calibrée sur
ses limites propres — en particulier la grammaire d'adressage, dont la sobriété
est un principe de lisibilité et non une concession à un modèle donné.

**Écarté après examen : la mémorisation du lot côté serveur et la comparaison
entre ce qui est soumis et ce qui a été simulé.** L'argument était d'empêcher
qu'un fichier hostile fasse écrire autre chose que ce qui a été montré. Mais la
simulation est produite par le même script que l'écriture : un script hostile n'a
pas besoin de montrer une chose et d'en écrire une autre, il lui suffit de montrer
ce qu'il veut. Le mécanisme coûtait de l'état serveur, une identité de lot et un
cycle de vie, pour ne couvrir qu'une attaque plus compliquée que celle qui
fonctionne. Ce qui couvre réellement un document hostile, ce sont les invariants.
Consigné pour que la décision ne soit pas reprise par défaut.

## Testing Decisions

Un bon test décrit un comportement observable depuis l'extérieur du module et
survit à une réécriture interne. Un test qui décrit une mécanique casse dès qu'on
change la mécanique, sans qu'aucun comportement n'ait bougé.

Les coutures ne sont pas choisies au cas par cas : elles sont **dérivées du type
de fichier**, selon le corpus d'architecture du dépôt, dont chaque fiche prescrit
le type de test attendu.

| Objet | Type de test | Ce qu'on vérifie |
|---|---|---|
| Entité portant l'attachement — **à créer**, elle n'existe pas | unitaire pur, aucune base, aucun double | la validation à la construction, et chaque méthode de changement d'état sur le cas passant **et** sur le refus |
| Entité portant le détachement — existante, anémique | unitaire pur | les refus qu'elle n'oppose pas aujourd'hui |
| Read-model « fiche d'organisation » | unitaire pur | la forme produite, les renommages, les mises en forme |
| Usecases d'attachement et de détachement | **intégration uniquement**, base réelle et fixtures | l'orchestration, le résultat, le traitement d'un attachement déjà existant, l'équivalence entre essai à blanc et opération réelle du point de vue des règles |
| Routes | acceptance, serveur réel et base réelle | les codes HTTP, **y compris les refus de droits** |
| Contrôleurs | unitaire, usecase substitué | que le bon usecase est appelé avec les bons paramètres |

Points d'attention issus du corpus :

- **Le test du refus est celui qui manque le plus souvent.** Vérifier qu'un
  détachement détache ne prouve rien ; vérifier qu'il refuse quand l'invariant
  serait violé prouve que l'invariant existe. C'est le test central de ce
  chantier, puisque le modèle actuel ne refuse rien.
- Sur les routes, un test qui vérifie un 200 pour un utilisateur autorisé
  passerait tout aussi bien sans aucun contrôle d'accès. Le test qui compte est le
  refus opposé à un rôle hors périmètre.
- Un objet du domaine qui a besoin d'une doublure pour être testé signale un
  défaut de conception, pas un besoin d'outillage.
- Un test d'invariant n'est écrivable que si l'invariant est formulé. L'attente de
  la liste auprès de l'équipe responsable n'est pas une contrainte subie : c'est
  l'ordre que le corpus prescrit.

**Pas de couture côté client** dans ce MVP : il ne contient aucun code client.

## Out of Scope

- **Le journal des opérations.** Reporté au deuxième utilisateur. Voir *Risque
  résiduel assumé* pour ce qui le remplace, et à quelle condition.
- **L'intégrité structurelle du domaine.** L'attachement est déjà idempotent et
  vérifie déjà l'existence des profils. Ce qu'il ne vérifie pas, l'existence de
  l'organisation, produit une erreur SQL et non des données fausses. Exigible
  avant d'ouvrir l'outil au-delà du test.
- **La création d'organisations en masse**, et le décommissionnement de l'import
  CSV existant. Objectif de plus long terme, hors de ce cas d'usage.
- **Toute opération de domaine nouvelle.** Les quatre opérations visées se
  réalisent avec l'existant. La recopie d'une organisation vers une autre est une
  composition faite par l'assistant.
- **La correction des données existantes non conformes**, et sa mesure. Chantier
  distinct, sans objet tant que le domaine n'oppose aucun refus nouveau.
- **Le tri par proximité** dans la recherche de profils cibles. Correspondance
  exacte au MVP ; à rouvrir si le fichier de l'utilisateur de test l'exige.
- **L'application Scalingo séparée pour le serveur MCP.** Rien ne l'exige avant
  qu'il y ait des partenaires.
- **L'ouverture effective du MCP aux partenaires.**
- **Pix Audit Logs.** Écarté après examen ; la question reste posée à l'équipe
  propriétaire mais ne bloque rien.
- **Le bridage de débit et les quotas par utilisateur.** Mesurer d'abord.
- **Tout le code du POC.** Jetable par nature.

## Further Notes

### Questions ouvertes, à rapporter avant implémentation

**Aucune question ne bloque le MVP.** La politique d'attribution n'étant pas une
règle de domaine, il n'y a pas de liste à obtenir avant de commencer.

Deux questions restent utiles, et se traitent en parallèle des tickets :

1. Auprès de l'équipe responsable des profils cibles : un profil obsolète est-il
   attachable, et que devient un profil attaché qui le devient ? Un détachement
   est-il toujours légitime, ou certains attachements sont-ils irrévocables parce
   que des campagnes en dépendent ? Portée sur le ticket d'intégrité structurelle,
   qu'elle n'empêche pas de commencer.
2. Auprès du métier : comment leurs fichiers désignent-ils une organisation ? La
   lecture est adressée par identifiant technique — si leurs fichiers ne portent
   que des noms ou des identifiants externes, un schéma de recherche
   d'organisation devient nécessaire.

Auprès du propriétaire de Pix Audit Logs, sans caractère bloquant : s'agit-il d'un
journal RGPD ou d'un journal généraliste des actions, quelle est sa rétention, et
rendre optionnel l'utilisateur cible pose-t-il un problème de fond ?

Auprès du délégué à la protection des données, avant la mise en service de
l'assistant : les contrats partenaires couvrent-ils le fournisseur d'inférence
comme sous-traitant ultérieur ? Le contenu des fichiers déposés lui est transmis —
systématiquement un extrait, intégralement pour un petit fichier, et le modèle peut
réclamer des plages supplémentaires.

Auprès de l'exploitation, pour les itérations suivantes : la politique de sécurité
de contenu est-elle pilotée par une variable d'environnement, et laquelle ?

### La politique de sécurité de contenu

Cette section conditionne la verticale V4, et elle seule.

**La politique en vigueur**, relevée sur une review app de Pix Admin :

```
script-src 'self' plausible.io analytics.pix.fr 'sha256-zzl6AX…'
connect-src 'self' plausible.io analytics.pix.fr pix-stats.cloud-ed.fr *.ingest.sentry.io
report-uri https://csp-report.pix.fr
```

Elle ne déclare ni `worker-src`, ni `child-src`, ni `default-src`. Les workers
retombent donc sur `script-src`. Trois conséquences :

- Un worker chargé depuis une ressource statique de l'origine passe, grâce à `'self'`.
- Un worker construit depuis un `blob:` est refusé : `blob:` n'est pas listé.
- `new Function` à l'intérieur du worker est refusé : `'unsafe-eval'` est absent.

**Les deux montages envisagés sont donc bloqués en l'état.** Exécuter du code
généré dans le navigateur demande une modification de cette politique.

Le fichier de simulation du dev-serveur présent dans le dépôt a dérivé de la
politique réelle : il lui manque le hash `sha256` et le `report-uri`. Il sert à
écarter rapidement un montage qui échoue déjà en local. Il ne prouve rien sur la
production.

La politique déclare un `report-uri`. Toute violation est remontée à l'équipe qui
la tient, y compris depuis une review app. Les essais doivent leur être annoncés.

**Les deux environnements ne demandent pas la même chose.** La politique d'une
review app se modifie sans accord de l'équipe sécurité. Seule la production
demande le leur. Le spike n'est donc bloqué par personne, et la demande pour la
production arrive ensuite avec des résultats observés.

**Trois options**, par capacité demandée croissante.

| Capacité | Politique actuelle de Pix Admin | Option A — ajouter `'unsafe-eval'` à la réponse de `/sandbox-worker.js` | Option B — ajouter `worker-src 'self' blob:` à la politique de Pix Admin |
|---|---|---|---|
| Charger un worker depuis l'origine de Pix Admin | oui | oui | oui |
| Charger un worker depuis `plausible.io` ou `analytics.pix.fr`, autorisé aujourd'hui par repli sur `script-src` faute de directive `worker-src` | oui | oui | non |
| Charger un worker depuis une URL `blob:` | non | non | oui |
| Compiler une chaîne de caractères en code dans la page | non | non | non |
| Compiler une chaîne de caractères en code dans le worker | non | oui | non |
| Exécuter le script généré par le modèle, objectif de la verticale V4 | non | oui | oui |

Chaque option débloque la dernière ligne. A ajoute une capacité, B en ajoute une
et en retire deux. L'option C ne figure pas dans ce tableau : elle ne modifie
aucune capacité de Pix Admin, puisqu'elle déplace l'exécution sur une autre
origine.

Ce tableau compare des capacités, pas des risques. Compiler des chaînes et créer
un worker depuis un blob ne pèsent pas pareil dans un modèle de menace : la
première rend exploitables des injections qui ne l'étaient pas, la seconde suppose
qu'un attaquant exécute déjà du script dans la page.

**Option A.** Le worker reçoit le script par message et le compile. Le harnais du
POC fonctionne tel quel. Restreinte au worker, la capacité vit dans un contexte
sans DOM, sans accès au stockage, dont la seule sortie est un message vers la page
hôte. Accordée globalement, elle affaiblit le front le plus privilégié de Pix :
`'unsafe-eval'` ne crée pas de faille, il rend exploitables des injections qui ne
l'étaient pas. La portée restreinte suppose que l'hébergement sache poser un
en-tête par chemin, ce qui reste à vérifier.

**Option B.** Le harnais et le script généré sont réunis dans un `blob:` dont on
fait le worker. Aucune compilation de chaîne nulle part. La capacité accordée est
plus étroite : créer un worker depuis un blob suppose de pouvoir déjà exécuter du
script dans la page. Une seule ligne dans la politique globale suffit, sans
en-tête par chemin. Ajouter un `worker-src` explicite resserre au passage la
situation actuelle, où `plausible.io` et `analytics.pix.fr` sont des sources de
worker valides par repli. En contrepartie, `sandbox-worker.js` est à retravailler,
et le comportement de `blob:` est à vérifier sur Chrome et Firefox.

**Option C.** L'exécution part sur une origine distincte, dans une iframe
cloisonnée qui reçoit les données par message. La politique de Pix Admin n'est pas
touchée. Cette origine a besoin de sa propre `'unsafe-eval'` : la faiblesse est
déplacée, vers un endroit sans session ni jeton. Le coût est une origine de plus à
héberger et à exploiter.

**Recommandation : B, avec A restreinte au worker en repli.** B demande la
capacité la plus étroite, ne dépend d'aucune particularité d'hébergement, et
resserre une permissivité existante. C reste disponible si les deux premières sont
refusées.

La demande à formuler tient en une phrase : ajouter `worker-src 'self' blob:` à la
politique de Pix Admin, pour exécuter du code généré dans un worker isolé, sans
accorder `'unsafe-eval'`.

### Résultats négatifs du POC, à ne pas racheter

Ces constats ne vivent que dans la branche jetable et sont coûteux à redécouvrir :

- Une approbation gérée côté serveur par le SDK d'inférence a été tentée et
  abandonnée le 2026-08-26 : le modèle ne reprenait pas la conversation après
  l'approbation. Ne pas retenter sans information nouvelle sur les versions en
  cause.
- Le worker doit être chargé depuis une ressource statique servie par l'origine et
  non depuis une ressource construite dynamiquement, Firefox ne couvrant pas cette
  dernière sous une politique restreinte à l'origine.
- Un appel en boucle locale doit viser l'adresse de bouclage et le port réellement
  lié : le répartiteur de charge réécrit sinon un en-tête de transfert, ce qui
  casse la validation d'audience du jeton.
- La politique de sécurité de contenu de production bloque la compilation de
  chaînes en code, ce qui a motivé le repli sur une exécution serveur.

### Arbitrage connexe

Le corpus d'architecture du dépôt classe le retour sur investissement de la
validation à la construction en rentabilité forte dans une fiche et en hygiène
dans une autre ; l'arbitrage est ouvert. Ce chantier lui fournit un cas concret :
une validation à la construction fait échouer la lecture des données existantes
non conformes, ce qui contraint l'ordre entre rattrapage et mise en application.
