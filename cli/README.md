PIX-CLI
=======

PIX-CLI est un programme logiciel de type "Interface en Ligne de Commande" (CLI).

Il s'agit d'une script Bash – pix-cli.sh – déployé directement sur le serveur de la plateforme.
  
Usage
-----

La meilleure façon d'utiliser le CLI est de se connecter en SSH sur le serveur, et d'exécuter la commande `pix <command> [specific_command_options]`.

Le CLI PIX permet entre autre de sauvegarder et restaurer les bases de données de production ou de staging (commandes `pix db:backup` et `pix db:restore`), de voir les logs applicatifs ou de base de données (`pix logs:app` et `pix logs:db`) ou encore de gérer les clés SSH de Dokku (`pix ssh-keys:*`).

Pour une description exhaustive des fonctionnalités offertes par le PIX-CLI, il suffit d'exécuter la commande `pix help` (défaut).

Déploiement
-----------

Pour déployer une nouvelle version du PIX-CLI, il faut exécuter la commande NPM `npm run deploy`.
