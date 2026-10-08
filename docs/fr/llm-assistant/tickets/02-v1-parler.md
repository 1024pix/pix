Status: ready-for-agent

# 02: V1 — parler à l'assistant

**What to build:** Un utilisateur de test ouvre Pix Admin, voit l'assistant, et
tient une conversation avec lui. Aucun outil, aucun dépôt de fichier, aucune
écriture. Les autres administrateurs ne voient rien.

C'est la première verticale, et la seule qui ne dépende de rien. Elle répond à
trois questions sur lesquelles la spec ne fait que spéculer : le modèle est-il
utile sur ce domaine, la latence est-elle supportable, l'interface est-elle
praticable.

**La restriction d'accès fait partie de cette verticale.** Sans elle, tous les
administrateurs voient l'outil et le test cesse d'être accompagné.

Deux mécanismes distincts, qui ne font pas le même travail. Le drapeau de
fonctionnalité coupe l'assistant pour tout le monde, sans livraison ; Pix en a un,
employé par le contexte `llm` à travers un pre-handler qui répond 503. La
whitelist dit qui a le droit pendant le test ; elle n'existe pas et reste à
écrire, le drapeau étant un booléen global.

## Le contrat de la route de conversation

Établi par le POC et vérifié de bout en bout avec `assistant-ui`. Il ne vit nulle
part ailleurs que dans la branche jetable.

```
POST /api/admin/llm-assistant/conversations/messages
Réponse : Content-Type text/event-stream
```

Le corps de la requête est produit par `AssistantChatTransport` de
`@assistant-ui/react-ai-sdk`. Sa forme appartient à la bibliothèque.

Propriétés à la racine du corps de la requête.

| Propriété | Type | Obligatoire | Arrive à | Rôle |
|---|---|---|---|---|
| `messages` | tableau de messages | oui | V1 | l'historique de conversation |
| `id` | chaîne | non | V1 | identifiant de la conversation, émis par le transport |
| `messageId` | chaîne | non | V1 | identifiant du message envoyé, émis par le transport |
| `trigger` | chaîne | non | V1 | ce qui a déclenché l'envoi, émis par le transport |
| `metadata` | objet | non | V1 | émis par le transport |
| `tools` | objet | non | V2 | les outils déclarés côté client |
| `documentContext` | chaîne | non | V4 | le résumé du document déposé |

Le contrôleur du POC ne lit que `messages`, `tools` et `documentContext`. Les
quatre autres propriétés sont acceptées par le schéma et jamais utilisées. Les
refuser ferait échouer les requêtes du transport.

Propriétés d'un élément de `messages`.

| Propriété | Type | Obligatoire | Rôle |
|---|---|---|---|
| `role` | chaîne | oui | l'émetteur du message. Le schéma ne contraint pas les valeurs. |
| `id` | chaîne | non | identifiant du message |
| `content` | chaîne, ou tableau de parties de contenu | non | le contenu d'un message au format ModelMessage |
| `parts` | tableau de parties de message | non | le contenu d'un message au format UIMessage |
| `metadata` | objet | non | données libres attachées au message |

L'objet message est déclaré `unknown(true)` : toute propriété non listée est
acceptée.

**Deux formats de message circulent sur cette route.** Le ModelMessage porte
`content`, l'UIMessage porte `parts`. Le premier tour arrive souvent en
ModelMessage ; les tours suivants arrivent en UIMessage, parce que les résultats
d'outils demandent la forme riche.

### Ce qu'il faut valider, et ce qu'il faut seulement connaître

Le serveur consomme quatre choses, et elles seules doivent être validées :

1. `messages` est un tableau ;
2. chaque message porte `role` ;
3. `messages[0].parts` est un tableau ou ne l'est pas, ce qui décide de la
   conversion ;
4. `content`, s'il est présent, est une chaîne ou un tableau.

Tout le reste est transmis à `convertToModelMessages` puis à `streamText`. Le
serveur ne le lit pas.

**Les deux tableaux ci-dessous servent à lire le trafic et à déboguer, pas à
écrire un schéma strict.** Une raison décide à elle seule : le type d'une partie
d'outil est `tool-` suivi du nom de l'outil. Il est construit à l'exécution. Une
énumération est donc impossible par nature, et le périmètre des outils change à
chaque verticale.

### Parties de contenu, dans `content` au format tableau

| `type` | Autres propriétés | Produite par |
|---|---|---|
| `text` | `text` : chaîne | le POC, quand il injecte le contexte document |

`convertToModelMessages` en produit d'autres, liées aux appels et aux résultats
d'outils. Le serveur ne les inspecte jamais.

### Parties de message, dans `parts`

Types observés et propriétés lues par le POC.

| `type` | Autres propriétés lues | Lue par |
|---|---|---|
| `text` | `text` : chaîne | l'interface, pour savoir si le message a du contenu |
| `reasoning` | `text` : chaîne | l'interface, même usage |
| `step-start` | aucune | l'interface, pour délimiter la dernière étape |
| `dynamic-tool` | `state` : chaîne, `providerExecuted` : booléen | l'interface, pour décider de renvoyer automatiquement |
| `tool-<nom de l'outil>` | `state` : chaîne, `providerExecuted` : booléen | idem |

Valeurs de `state` observées : `output-available`, `output-error`.

Cette liste est ce dont le POC dépend, pas l'inventaire complet du SDK. L'autorité
sur ces formes est la version du SDK employée, pas ce document.

**Le discriminant est `Array.isArray(messages[0].parts)`.** La conversion a lieu
si et seulement si le premier message porte `parts`. Ce test décide du traitement
de tout le tableau.

Ces tolérances sont volontaires. La forme des messages appartient au SDK et change
d'une version à l'autre. Valider strictement un objet produit par une bibliothèque
casse à chaque montée de version.

**Deux comportements de cette route, découverts par le POC.** La fenêtre est
tronquée à 20 messages, en garantissant toujours au moins un message `user` :
sans cela Qwen refuse la requête avec « No user query found ». Et le contexte
document est injecté dans le dernier message `user` **après** la conversion, sinon
`convertToModelMessages` l'ignore.

Le corps de la réponse est le flux produit par
`toUIMessageStreamResponse({ sendReasoning: true }).body`. `assistant-ui` le
consomme directement.

**Trois contraintes que le POC a payées**, à ne pas racheter :

1. Le contrôleur écrit `: ping\n\n` toutes les 20 secondes. Sans cela, Scalingo
   coupe la connexion pendant que le modèle raisonne en silence.
2. Les erreurs du flux doivent être absorbées. Si une erreur remonte à Hapi après
   le début de la réponse, Hapi tente de poser des en-têtes sur une réponse déjà
   commencée. Cela lève `ERR_HTTP_HEADERS_SENT` et fait tomber le processus.
3. Hapi ne prend pas un flux web. Il faut passer par `Readable.fromWeb(stream)`
   puis un `PassThrough`.

## Où vit quoi

### L'ordre d'écriture et les couches

Le corpus d'architecture prescrit l'ordre : **le usecase d'abord**, puis le
sérialiseur, puis le contrôleur, puis la route. Écrire la route en premier pousse
à mettre la logique dans le contrôleur, faute d'un autre endroit où la mettre.

| Couche | Rôle | Invariants |
|---|---|---|
| Route | déclare et valide la forme des entrées, déclare les contrôles d'accès en pre-handler | R1, R2 |
| Contrôleur | extrait, appelle un seul usecase, rend la réponse. Aucune décision, code d'erreur compris | C1, C2 |
| Désérialiseur | construit la conversation à partir du payload | — |
| Usecase | orchestre des objets du domaine. Aucune règle métier, aucun import d'infrastructure | U1, U3, U4 |
| Conversation | détient la règle de la fenêtre | — |
| Adaptateur | traduit la conversation vers le fournisseur | — |

**Le usecase ne reçoit pas le payload. Il reçoit une conversation.** La forme du
SDK s'arrête au désérialiseur, et le domaine ignore `parts` comme `content`.

**Ce que la route déclare.** R1 sépare la forme de la règle métier, et nomme une
troisième catégorie : le maximum arbitraire, « ni l'un ni l'autre ». Une liste
figée des types de parties tombe là, puisqu'elle ne suivrait pas les ajouts
d'outils. La forme se déclare sans énumérer :

```js
parts: Joi.array().items(Joi.object({ type: Joi.string().required() }).unknown(true))
```

La validation stricte des valeurs reste juste là où nous possédons le contrat :
les schémas des outils, en V2 et V3.

### Le modèle de domaine

La ligne de partage : **l'infrastructure communique avec le fournisseur, le
domaine construit ce qu'elle transmet.**

`Conversation` est une racine d'Aggregate. Elle porte `messages` et
`systemPrompt`, et elle détient la logique qui compose ce qui part vers le
modèle. `Message` est une Entity.

La frontière de cohérence, au sens de A1 : « tout message porté par cette
conversation est un Message de ce contexte ». C'est le patron de `CombinedCourse`
et de ses participations.

**La `Conversation` vérifie les invariants, la route ne déclare que la forme.**
La présence d'une question en relève : « le tableau contient au moins un message
de rôle `user` » n'est pas écrit sur la route. La règle porte sur la fenêtre, que
la troncature peut vider de sa question, et c'est là qu'elle travaille — pas à
l'entrée.

**Ce que la conversation compose :**

- le prompt système, assemblé à partir de morceaux nommés — une partie générale
  en préfixe, la date à la fin ;
- la troncature de la fenêtre ;
- l'injection du contexte document, en V4 ;
- les messages temporaires, par exemple un rappel ajouté en fin de liste.

**Le port est défini par le domaine, le repository l'implémente.** Sa méthode
`stream` reçoit donc une `Conversation` et rend le flux. Elle ne décide rien.

A2 impose une conséquence : le repository ne doit pas atteindre la collection
interne de l'Aggregate. La conversation rend une structure construite pour
l'appel — prompt système assemblé et messages projetés — et non sa propre liste.

L'Aggregate se justifie ici par son **comportement**, pas par son identité. Rien
ne persiste et rien ne désigne une conversation par un identifiant ; c'est la
logique de composition qui fait exister l'objet.

| Quoi | Où |
|---|---|
| Assembler le prompt système | Conversation |
| Tronquer la fenêtre | Conversation |
| Insérer un message temporaire | Conversation |
| Injecter le contexte document | Conversation |
| Quels outils sont exposés au modèle | usecase |
| Parler au fournisseur, transformer le flux, écrire le ping | repository |

**Les messages temporaires : projection ou changement d'état.** Si le rappel
n'existe que dans ce qui est projeté vers le modèle, il n'y a rien à retirer
ensuite, et la conversation reste immuable. Si le rappel doit survivre d'un tour
au suivant, alors c'est un vrai changement d'état, et la méthode qui le porte se
teste sur le cas passant et sur le refus.

La première option coûte moins : ajouter puis retirer est une séquence qui peut
être interrompue par une erreur ou par deux envois concurrents, et le rappel
reste alors collé à la conversation.

**La date entre par paramètre.** Le prompt système porte la date du jour. Si la
conversation la lit elle-même, l'assemblage ne se teste plus sans dépendre du
jour où tourne le test.

**Le prompt système appartient au domaine.** Il porte aujourd'hui le contrat
« attends la réponse de l'utilisateur avant d'agir », c'est-à-dire une règle
métier écrite en français dans une chaîne d'infrastructure. Assemblé à partir de
morceaux nommés, il devient testable morceau par morceau.

**Configuration du fournisseur.** L'adresse, la clé et le modèle viennent de la
configuration, sous la clé `llmAssistant`, alimentée par `LLM_ASSISTANT_BASE_URL`,
`LLM_ASSISTANT_API_KEY` et `LLM_ASSISTANT_MODEL`. Les paramètres
d'échantillonnage, eux, restent écrits en dur dans le repository.

Ces trois variables doivent figurer dans `api/sample.env`, sans quoi personne ne
sait quoi régler en clonant la branche.

### L'implémentation minimale du repository

`stream` reçoit une `Conversation` et rend **le flux ouvert**. Elle ne rend pas de
conversation à jour : rien ne persiste côté serveur, le navigateur détient
l'historique et le renvoie entier au tour suivant.

```js
const provider = createOpenAI({ baseURL, apiKey });

const result = streamText({
  model: provider.chat(modelName),
  system: systemPrompt,
  messages: modelMessages,
  temperature: 0.6,
  topP: 0.95,
  maxTokens: 32768,
});

return result.toUIMessageStreamResponse().body;
```

**Produire `modelMessages`.** Un ModelMessage est `{ role, content }`, le contenu
étant une chaîne ou un tableau de parties de contenu. Deux cas se présentent.

Si le client envoie déjà des `{ role, content }`, il n'y a **rien à convertir** :
`modelMessages` est le tableau reçu. C'est ce qu'envoie le client en ligne de
commande, donc la boucle de discussion minimale n'a pas besoin de
`convertToModelMessages`.

Si le client envoie des UIMessage, reconnaissables à leur tableau `parts`, il faut
convertir. C'est ce que produit `assistant-ui`.

```js
const modelMessages = Array.isArray(messages[0]?.parts)
  ? await convertToModelMessages(messages)
  : messages;
```

Le POC passe `{ tools }` en second argument. Inutile en V1, où aucun outil n'est
déclaré au modèle.

La troncature de la fenêtre n'apparaît pas ici : elle appartient à la
`Conversation`, qui rend déjà les messages projetés.

Quatre points que la documentation du SDK laisse dans l'ombre, et que le POC a
payés :

- `provider.chat(modelName)` et non `provider(modelName)`. L'appel direct peut
  router vers une autre API selon la version du SDK.
- `system` est un paramètre séparé, une chaîne. Le prompt assemblé par la
  conversation va là, et `messages` ne contient aucun message de rôle système.
- `.body` est indispensable. `toUIMessageStreamResponse()` rend une `Response`
  complète, le contrôleur veut le flux.
- `convertToModelMessages` ne sert que si l'entrée est au format UIMessage. Le
  POC le teste par `Array.isArray(messages[0].parts)` et ne convertit que dans ce
  cas.

Les trois paramètres d'échantillonnage viennent du POC.

Le raisonnement est coupé en dur, au niveau du modèle. Le reste — restitution du
raisonnement, outils, document — n'entre pas dans ce minimum.

Une dette à connaître : `convertToModelMessages` prend la forme du SDK, donc la
placer dans le repository fait entrer `parts` et `content` dans le domaine. C'est
assumé pour un minimum destiné à être remplacé ; le placement cible est le
désérialiseur.

**Le test qui range une règle.** Si elle survit à un changement de fournisseur
d'inférence, elle appartient au domaine. Sinon elle est subie, et elle appartient
à l'adaptateur.

La fenêtre doit contenir une question. Qwen refuse sans, mais tronquer une
conversation jusqu'à en retirer la question produit une réponse sans question,
quel que soit le fournisseur. La règle appartient donc au domaine. Qwen en est la
cause, et une cause se consigne sans façonner le code.

### Le usecase

`createOrContinueConversation`, dans `create-or-continue-conversation.js`. Verbe
d'action, comme les usecases voisins, et sans suffixe comme le contexte des
profils cibles. Il ne laisse fuir ni le flux, ni le modèle, ni le SDK, et il
survit à V2 et V3 : la conversation continue, quels que soient les outils.

Le POC l'appelle `converse`. Son corps transmet six paramètres et ne décide rien,
ce qui ne laisse aucune orchestration à vérifier. Avec la répartition ci-dessus,
il décide, donc il devient testable pour ce qu'il décide.

**Ce que le nom dit, et ce qu'il ne dit pas.** Au premier message d'un
utilisateur, il n'y a pas encore de conversation : ce message la fait exister.
Les appels suivants la continuent. Le nom décrit donc deux chemins dans un même
appel.

Il n'implique aucune persistance. Le serveur ne stocke pas de conversation et n'en
possède pas d'identité. Il reçoit l'historique entier à chaque tour et le
navigateur le détient. La propriété `id` du payload reste donc acceptée et non
lue, comme décrit dans le contrat plus haut.

**Blocked by:** None (can start immediately)

- [ ] Un drapeau de fonctionnalité coupe l'assistant sans livraison, sur le modèle
      du pre-handler existant du contexte `llm`
- [ ] Une liste d'identifiants d'utilisateurs, tenue en variable d'environnement,
      restreint l'accès pendant le test
- [ ] La whitelist est vérifiée **sur les routes**, pas seulement à l'affichage.
      Masquer un bouton n'est pas un contrôle d'accès.
- [ ] Un utilisateur hors whitelist reçoit un refus de l'API — test du refus, et
      non seulement du cas passant
- [ ] Une route de conversation en flux relaie les messages vers le fournisseur
      d'inférence
- [ ] L'assistant est monté dans les pages authentifiées de Pix Admin et n'apparaît
      que pour les utilisateurs de la whitelist
- [ ] Aucun outil n'est déclaré au modèle à ce stade
- [ ] `Conversation` est une racine d'Aggregate portant `messages` et
      `systemPrompt`. `Message` est une Entity. Tests unitaires sans stub, mock ni
      spy.
- [ ] La conversation assemble le prompt système à partir de morceaux nommés, et
      tronque la fenêtre. Chaque morceau se teste séparément.
- [ ] La date du jour entre par paramètre, jamais lue depuis la conversation.
- [ ] Le port est défini par le domaine. La méthode `stream` du repository reçoit
      une `Conversation` et ne décide rien.
- [ ] Le repository n'atteint pas la collection interne de l'Aggregate. La
      conversation rend une structure construite pour l'appel.
- [ ] Un désérialiseur construit la conversation à partir du payload. Le usecase
      ne reçoit jamais le payload.
- [ ] Le usecase décide des outils exposés et de l'injection du contexte document.
      L'adaptateur ne fait que parler au fournisseur.
- [ ] La route déclare la forme de toutes les entrées, sans énumérer les types de
      parties.

La comparaison se fait sur l'identifiant d'utilisateur et non sur le courriel :
c'est ce que porte le jeton, donc aucune recherche en base n'est nécessaire à
chaque requête.
