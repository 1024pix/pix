# 10. Ajout d'une file de jobs asynchrones gérée par la librairie Bull

Date : 2020-04-21

## État

Proposition

## Contexte

Certaines opérations ne sont pas obligatoirement synchrones de l'appel API entrant.
C'est le cas par exemple de l'envoi de mail.
L'envoi de mail est délégué (via un appel API) à un fournisseur tiers (Sendinblue ou Mailjet).
Pour la résilience de Pix, l'échec de l'envoi via le fournisseur ne doit pas entraîner l'échec de la création de compte.

Actuellement, on fait un appel asynchrone non géré (i. e. on n'attend pas le retour de l'appel API). 
Ce fonctionnement n'entraîne pas l'échec de la création de compte si le fournisseur d'envoi de mails rencontre
des problèmes.
En revanche, cela ne permet pas de stratégie de ré-essai en cas d'échec. 
**Un mail en échec ne sera jamais envoyé plus tard.**

## Décision

L'utilisation d'une file de jobs asynchrones permet d'envoyer les mails en contrôlant la concurrence des appels API (vers le
fournisseur d'envoi de mails), de ré-essayer un certain nombre de fois un envoi en échec, espacé d'un temps défini.

L'implémentation proposée repose sur l'usage de [bull](https://github.com/OptimalBits/bull/).
Cette dépendence tierce permet la création et la gestion simplifiée d'une file de jobs en se basant sur un serveur REDIS.

Toutes les informations motivant cette décision sont disponibles ici : [https://1024pix.atlassian.net/wiki/x/AQBMUw](https://1024pix.atlassian.net/wiki/x/AQBMUw).

## Conséquences

Il faut créer une file de job dans un fichier dans le dossier `lib/infrastructure/queued-jobs`.
Voir pour exemple le fichier `lib/infrastructure/queued-jobs/create-send-email-queue-service.js`.

Ce fichier exporte une fonction de création de la file de job et les options du job.
On recommande les options suivantes :
- `removeOnComplete` à `true` afin de ne pas stocker les jobs réussis.
- `removeOnFailed` à `1` afin de ne garder qu'une seule occurence d'un job échoué (pas de stockage des ré-essais en cas d'échec).

Il faut créer un fichier `processor` dédié.
Voir pour exemple le fichier `lib/infrastructure/mailers/send-email-job-processor.js`.

Cela permet d'exécuter le job dans un nouveau process, et donc d'optimiser l'usage CPU et de ne pas bloquer le process parent (l'api).
