# 56. Standardisation de l'exécution des scripts Node.js

Date : 2024-10-22

## État

Proposé

## Contexte

### Développement / Maintenance

Dans le cadre de notre développement de scripts Node.js, nous constatons des problèmes récurrents liés à la duplication de code et au manque d’outils et de documentation :

- Nous redéveloppons du **code boilerplate** similaire à chaque nouveau script, pour la gestion des paramètres d’entrée, la gestion des erreurs, et la gestion des ressources.
- Des **scripts “one-shots”** ou “jetables” restent dans la codebase bien après leur utilisation initiale, sans un mécanisme clair de maintenance ou de suppression.
- Il existe **peu de documentation** pour les scripts et leur utilisation.

### Exploitabilité

Sur le plan opérationnel, l’exécution des scripts pose également plusieurs problèmes, notamment aux Capitaines qui ont en charge leur exécution :

- Il arrive que nous **oublions de fermer certaines ressources**, comme des connexions à la base de données, une fois le script terminé.
- **Mauvaise gestion des codes de sortie** : certains scripts nécessitent d’être manuellement arrêtés lorsqu’ils échouent à se terminer correctement.
- **Les logs des scripts sont insuffisants** : absence de compte-rendu des opérations (début, fin, erreurs) et de logs de progression pour les scripts longs.
- **Surcharge de la base de données** : certains scripts effectuent un grand nombre de requêtes sans limitation, mettant en danger la stabilité de l’infrastructure.
- **Absence de mesure d’impact** : il manque des fonctionnalités pour mieux estimer l’impact de chaque script (temps d’exécution, risque sur l’environnement de production, etc.), comme un mode `dry-run` pour simuler les effets du script sans écriture en base de données.

### Guidelines et bonnes pratiques

Enfin, nous n’avons pas de cadre clair pour la création et la maintenance des scripts :

- **Documentation insuffisante** : Comment créer un nouveau script ? Comment le tester ?
- Manque de recommandations sur les scripts **interruptibles** et **idempotents** pour assurer une meilleure résilience.

## Décision

Afin de résoudre ces problèmes, nous proposons de **standardiser l'exécution des scripts Node.js** en introduisant une **classe de script générique** et un **runner** qui encapsulent les fonctionnalités clés :

1. **Définition des arguments d’entrée** du script (via [yargs](https://github.com/yargs/yargs)).
2. **Injection de dépendances** : chaque script pourra injecter un logger ou d'autres dépendances.
3. Inclusion de **parsers préconfigurés** pour éviter de redévelopper la lecture et la gestion des arguments CLI à chaque script (ex: `CsvFileParser`, `CommaSeparatedNumbersParser`...).
4. **Logging structuré** pour chaque script :
   - **Début d'exécution** et **fin d'exécution** loggés systématiquement.
   - **Arguments d'entrée loggés** afin de garder une trace des configurations utilisées lors de l’exécution.
   - **Logs de fin** pour indiquer si le script s’est terminé en succès ou en échec, avec les détails d’erreur et la stack si applicable.
5. **Gestion des ressources** : fermeture automatique de toutes les connexions et ressources en fin d’exécution (connexions à la base de données et au cache Redis).
6. Ajout de **métadonnées sur chaque script** :
   - **Description** du script.
   - Indicateur indiquant si le script est **permanent** ou s’il s'agit d'un **one-shot**.
   - **Exemple d’utilisation** et documentation intégrée.

De plus, **une documentation et des guidelines complètes** accompagneront cette standardisation.

> [!NOTE]
> Voici la PR, réalisée en tech time sur la **mise en place de cette solution**: https://github.com/1024pix/pix/pull/10273

### Exemples d’utilisation

Un exemple simple d’utilisation d’un script via cette classe standardisée et du runner :

```javascript
import { BaseScript } from "src/shared/application/scripts/base-script.js";
import { ScriptRunner } from "src/shared/application/scripts/script-runner.js";

const columnsSchemas = [
  { name: "foo", schema: Joi.string() },
  { name: "bar", schema: Joi.string() },
];

class MyCustomScript extends BaseScript {
  constructor() {
    super({
      description: "This is the complete description of my awesome script",
      permanent: true,
      options: {
        file: {
          type: "string",
          describe: "CSV File to process",
          demandOption: true,
          coerce: csvFileParser(columnsSchemas),
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info(`File data: ${options.file}`);
    // ... custom script logic ...
  }
}

await ScriptRunner.execute(import.meta.url, MyCustomScript);
```

### Fonctionnalités supplémentaires

Ce design permet l'ajout de nouvelles fonctionnalités afin de répondre à l'ensemble des problématiques initiales :

- **Proposer un mode dry-run** : Permettre l’exécution des scripts sans effectuer d’écriture en base de données ou toute autre modification d'état. Cela aiderait à estimer les effets d’un script avant son lancement réel.
- **Fournir un utilitaire de throttling** : Limiter le nombre d'exécutions par seconde ou définir des intervalles de temps minimum entre chaque exécution d’une action (par exemple des requêtes SQL). Cela éviterait de surcharger les bases de données ou d'autres services.
- **Fournir un utilitaire de progression** : Ajouter un mécanisme permettant de logger la progression d’un script, utile pour les scripts longs ou complexes. Cela inclurait des informations sur les étapes atteintes ou le pourcentage de progression.
- **Lister l’ensemble des scripts et leurs métadonnées** : Ajouter une fonctionnalité permettant de lister tous les scripts présents dans la codebase avec leurs métadonnées (description, arguments, options, etc.), afin de mieux gérer et documenter les scripts existants.
- **Stocker en base les informations d'exécution** : Créer une table en base de données pour enregistrer les informations d'exécution des scripts, telles que le nom du script, l’heure de début et de fin, le statut (succès ou échec), et la progression. Cela fournirait une visibilité historique et permettrait un suivi précis des scripts exécutés. (Voir la PR https://github.com/1024pix/pix/pull/10095)

### Alternatives envisagées

- **Continuer sans standardisation** : cela résulterait en la poursuite de la duplication du code boilerplate et des pratiques ad hoc. Cette option a été écartée car elle ne répond pas aux besoins de maintenance et d’exploitabilité.
- **Utiliser un framework ou une librarie** :
  - [Trigger.dev](https://trigger.dev/). Bien que Trigger.dev offre de nombreuses fonctionnalités utiles comme la gestion des jobs asynchrones et la planification (scheduling), son intégration dans notre codebase serait beaucoup plus coûteuse en termes de temps et d'impact sur la plateforme.
  - [Commander](https://github.com/tj/commander.js). La bibliothèque Node.js **commander** permet de créer des interfaces en ligne de commande en gérant les commandes, options et arguments, avec génération automatique de l'aide. Nous avons toutefois opté pour **[yargs](https://github.com/yargs/yargs)**, qui offre les mêmes fonctionnalités, et était déjà présent comme dépendance dans le projet Pix (notamment pour certains scripts).

## Conséquences

### Positives :

- Scripts plus faciles à maintenir, tester, et exécuter.
- Moins de risques d'erreurs humaines lors de la création ou l’exécution des scripts.
- Meilleure visibilité pour les capitaines sur les impacts des scripts sur les systèmes de production.
- Documenter et proposer des guidelines aux équipes sur son utilisation.

### Négatives :

- Nécessite un effort initial de développement pour mettre en place la classe de base et ses fonctionnalités.
- Nécessite de migrer les scripts existants vers ce nouveau standard. (environ une quarantaine de scripts)
