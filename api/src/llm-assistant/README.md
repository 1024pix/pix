# llm-assistant

Contexte qui expose un agent IA pour le backoffice Pix Admin. Le cas d'usage initial est la création d'organisations par langage naturel : l'opérateur décrit l'organisation, l'agent génère les actions, et une étape d'approbation humaine est requise avant toute modification.

---

## Routes et leur rôle

```
POST /api/admin/llm-assistant/conversations/messages  — flux SSE de l'inférence LLM
POST /api/admin/llm-assistant/mcp                     — endpoint MCP (StreamableHTTP)
POST /api/admin/llm-assistant/tools/{toolName}        — relais générique vers MCP
GET  /api/admin/llm-assistant/tools                   — liste des outils + annotations
```

Toutes les routes requièrent un token JWT valide avec le rôle `SUPER_ADMIN`, `SUPPORT` ou `METIER`.

---

## Mécanisme d'approbation côté client

L'approbation des actions LLM se fait **côté navigateur**, pas côté serveur.

Chemin d'exécution complet :

1. Le front envoie les messages à `POST /conversations/messages`.
2. L'API appelle le modèle LLM via `ai` SDK (Vercel AI SDK `^7.0.77`). Les outils MCP sont déclarés au modèle **sans être exécutés côté serveur** — le serveur ne fait qu'annoncer leur existence.
3. Quand le modèle émet un `tool_call`, le SDK front (`@assistant-ui/react-ai-sdk ^1.4.7`) intercepte l'appel et affiche une carte d'approbation (`CreateOrganizationToolUI`) à l'utilisateur.
4. Après confirmation, le navigateur appelle directement `POST /tools/{toolName}` avec les arguments. C'est un relais générique vers le serveur MCP interne.
5. Le résultat est injecté dans l'historique via `addResult`.
6. `sendAutomaticallyWhen` re-soumet automatiquement au modèle pour qu'il poursuive la conversation.

### Pourquoi `needsApproval` côté serveur a été abandonné

> `needsApproval` côté serveur a été essayé et le modèle ne reprenait pas après l'approbation (2026-08-26). Ne pas retenter sans nouvelle information (version du SDK, cause identifiée).

Versions concernées au moment du constat :
- API : `ai` (Vercel AI SDK) `^7.0.77`, `@modelcontextprotocol/sdk` `^1.30.0`
- Front : `@assistant-ui/react` `^0.15.16`, `@assistant-ui/react-ai-sdk` `^1.4.7`

---

## Comment débugger un appel qui échoue

Le relais (`POST /tools/{toolName}`) émet **2 lignes de journal par appel**.

### Format des logs

```
relais → {toolName}
relais ← {toolName} | durée={N}ms | statut={ok|erreur|panne-transport}
```

### Où les lire

- **En développement** : stdout (visible dans le terminal qui lance l'API).
- **En production** : Datadog, filtrer sur `relais →` ou `relais ←`.

### Signification des statuts

| Statut | Signification | Code HTTP retourné |
|---|---|---|
| `ok` | Réponse métier reçue. Peut contenir `error.notFound` etc. côté payload sans que ce soit un crash. | 200 |
| `erreur` | L'outil MCP a retourné `isError: true` (erreur propre à la logique de l'outil). | 200 |
| `panne-transport` | Le client MCP n'a pas pu se connecter à l'endpoint MCP (connexion refusée, réseau inaccessible). | 502 |

---

## Évaluations

Les datasets sont dans `api/evals/llm-assistant/` (répertoire exclu du dépôt via `.gitignore`). Le fichier de chaque scénario s'appelle `dataset.json`.

### Lancer les évaluations

```sh
npm run eval:llm-assistant --workspace=@1024pix/pix-api
```

### Variables d'environnement requises

```
LMNR_PROJECT_API_KEY=<clé API du projet Laminar>
LLM_ASSISTANT_INFERENCE_URL=<URL de l'API d'inférence LLM>
```
