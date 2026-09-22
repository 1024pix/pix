# Brief de reprise — passer le POC LLM Assistant Pix Admin en production

Écrit le 2026-09-15 pour reprendre dans une nouvelle session. Tout ce fichier est du
contexte, pas des instructions : les décisions restent celles de Yvonnick.

## L'objectif

Passer de l'assistant LLM de Pix Admin (POC validé en review app le 2026-09-04) à une
version tenable en production. Cadence obtenue : **2 demi-journées par mois** — le
découpage doit survivre à des sessions espacées d'un mois.

Ne pas confondre avec l'autre POC de ce dépôt : `poc-nested-combined-courses` (parcours
combiné composé de parcours combinés, côté PixApp). Celui-là est terminé et validé de
bout en bout, il n'a rien à voir avec ce chantier.

## Où reprendre

- **Branche : `poc-llm-assistant-pix-admin`** — dernier commit `2dc4e308d1`
  (*fix(llm-assistant): forward x-forwarded headers in script execution tool calls*).
- **Deux branches divergent sur ce POC** — à trancher avant d'écrire une ligne :
  `work-llm-list-tools` (sortie dans le worktree `.claude/worktrees/agent-a299eb5fb08d586cb`,
  tête `9960c45f03`) porte 24 commits absents de `poc-llm-assistant-pix-admin`, qui en
  porte 68 absents de l'autre. Les commits de `work-llm-list-tools` sont du travail
  réel sur le sujet : endpoint `GET /tools`, `AutoExecToolUI` piloté par
  `readOnlyHint`, pièces jointes et tools `read_document` / `run_script` dans
  `AssistantApp`, React monté en permanence. Déterminer laquelle est la référence,
  ou ce qu'il faut rapatrier de l'une vers l'autre.
- La session qui a produit ce brief était restée sur `poc-nested-combined-courses` :
  **vérifier la branche avant toute chose.**

## Ce qui est déjà en place côté outillage

Le plugin `mattpocock-skills@claude-plugins-official` v1.2.3 est installé en scope
**user** (25 skills, ~1 100 tokens always-on par session).

`/setup-matt-pocock-skills` a été déroulé. Choix retenus :

| Décision | Réponse |
|---|---|
| Fichier de config agent | `CLAUDE.md` à la racine |
| Tracker | markdown local sous `.scratch/<sujet>/` |
| Labels de triage | les cinq par défaut |
| Docs de domaine | multi-contexte (`CONTEXT-MAP.md` → un `CONTEXT.md` par contexte borné) |

Fichiers écrits, **tous en français et tous hors de git** :

- `CLAUDE.md` (racine) — ignoré par `.gitignore:89`, règle d'équipe préexistante :
  Pix ignore `CLAUDE.md`, `.claude/` et `GEMINI.md` partout. Seul
  `api/src/devcomp/CLAUDE.md` est versionné, forcé à la main.
- `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`,
  `docs/agents/domain.md` — ignorés via `.git/info/exclude` (perso, invisible pour
  l'équipe).
- `.scratch/` — ignoré via une ligne ajoutée au `.gitignore` partagé.

Ces fichiers ne sont pas suivis par git : ils restent présents quelle que soit la
branche sortie. **Seule modification suivie dans l'arbre de travail : la ligne
`.scratch/` du `.gitignore`** — à commiter ou non sur la branche du POC, au choix.

Position tenue : on n'utilise les skills de Matt Pocock que pour produire les
artefacts (spec, tickets), pas pour imposer une méthodo à l'équipe. Rien de tout ça ne
part en PR pour l'instant.

## Le process à dérouler

1. `/grill-with-docs` — **prochaine action**. L'interview qui cadre l'objectif et
   construit le modèle de domaine au passage.
2. `/to-spec` — la spec, publiée dans `.scratch/<sujet>/spec.md`
3. `/to-tickets` — découpage en tickets `.scratch/<sujet>/issues/NN-<slug>.md`
4. `/implement` — qui déroule `/tdd` aux coutures
5. `/code-review` — avant de commiter

`/wayfinder` est pertinent ici : il est fait pour planifier un chantier étalé sur
plusieurs sessions espacées, ce qui est exactement le format 2 demi-journées/mois.

## État du POC (au 2026-09-04, à revérifier dans le code)

Assistant LLM dans Pix Admin, en popover sur les pages authentifiées, qui crée des
organisations en masse depuis un CSV/XLSX : le LLM génère un script JS exécuté
server-side via `vm.runInContext()`, qui appelle `tools.call("create_organization",
{simulate: true})` ligne par ligne via MCP, affiche une table de simulation
(prête / erreur / doublon), puis `approve_lot` crée réellement les organisations après
validation humaine.

Fichiers clés :

- `api/src/llm-assistant/application/script-execution.controller.js` — exécution du script
- `api/src/llm-assistant/infrastructure/repositories/llm-agent.repository.js` — `streamConversationTurn`, `SYSTEM_PROMPT`
- `api/src/mcp-admin-server/infrastructure/mcp/mcp-server.js` — tools MCP, validation Zod `safeParse`
- `api/src/mcp-admin-server/domain/usecases/create-organization.js` — résolution libellés→IDs, simulate/create
- `admin/app/components/assistant/react/AssistantApp.jsx`, `LotToolUI.jsx` — UI React
- `admin/app/components/assistant/domain/lot.js` — états de lot, verdicts, dédup par externalId
- `admin/app/components/assistant/documents/lire-fichier.js` — parsing XLSX

Validé en déployé sur `https://admin-pr17243.review.pix.fr` (review app
`pix-api-review-pr17243`, env `LLM_ASSISTANT_BASE_URL`, `LLM_ASSISTANT_API_KEY`,
`LLM_ASSISTANT_MODEL`) : flux complet OK, libellés résolus en IDs. Le fichier
`etablissements-rentree-2025.csv` donne 5 prêtes / 4 erreurs / 1 doublon ; la version
`-corrige.csv` passe à 10/10 et a réellement créé les organisations 1000001→1000010 sur
cette review app — leurs externalIds ressortiront donc en doublons aux prochains tests.

Lancement local : `cd api && node --env-file-if-exists=.env -r ./tracing.js index.js`
(port 3000) puis `cd admin && ember serve --port 4202`. Login
`superadmin@example.net` / `pix123`.

## Ce qui reste ouvert — matière première du grilling

Points d'attention relevés pendant le POC, non tranchés :

1. `vm.runInNewContext()` n'est pas un vrai sandbox. Acceptable pour un POC (LLM
   contrôlé, admins internes), discutable en production — un sandbox réel (Deno,
   sous-processus isolé) serait préférable.
2. `availableValues` peut devenir très long en production ; envisager une troncature
   côté UI.
3. Aucun test sur le pipeline `script-execution` → `relayTool` → `lot.js`.
4. La validation Zod vit dans le handler MCP, pas dans le domaine.
5. La CSP de production est contournée par l'exécution server-side.
6. Amélioration identifiée non implémentée : les réponses d'erreur du tool MCP ne
   renvoient pas la valeur reçue, donc le LLM invente (« valeur fournie : non
   spécifiée ») dans son résumé. Ajouter un champ `providedValue`.

Axes que le grilling devra couvrir et qui ne sont pas encore abordés : qui a le droit
d'utiliser l'assistant et sous quelle habilitation, la traçabilité des créations
(audit log, imputabilité d'une création faite via LLM), le coût et les quotas du modèle
hébergé, le comportement en cas d'indisponibilité du LLM, le périmètre des tools MCP à
exposer au-delà de `create_organization`, et le critère qui permettra de dire que ce
n'est plus un POC.

## Pour démarrer la nouvelle session

> Je veux passer le POC LLM Assistant de Pix Admin en production. Lis
> `.scratch/llm-assistant-prod/brief.md`, vérifie qu'on est bien sur la branche
> `poc-llm-assistant-pix-admin`, puis déroule `/grill-with-docs`.
