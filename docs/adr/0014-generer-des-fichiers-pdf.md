# 14. générer des fichiers pdf

Date: 2020-09-24

## Status

Accepted

## Context

[L'attestation de la certification](../assets/attestation_WF_V2-simple-filigrame.pdf) doit pouvoir être exportée au format PDF. 
Elle doit correspondre à la charte et permettre soit d'être imprimée, soit stockée (téléchargeable) en gardant les liens hypertextes actifs et la copie de texte (code de vérification).
C'est pour le moment le seul document à exporter.
Les différentes parties dynamiques sont :
- les infos personnelles du candidat
- le score
- les niveaux par compétence
- le code de vérification
- le badge cleA numérique (optionnel)

Les domaines/competences sont fixes. Le seul élément qui va être vraiment variable sera le badge qui est optionnel.

Cette fonctionnalité est très attendue et va être suivie par des fortes échéances.

Le fichier est téléchargé via un clic utilisateur et n'a pas besoin d'être généré automatiquement (cron etc)

Ce fichier sera téléchargeable depuis différentes applis PIX (pix app, orga...)

Il n'y a pas encore d'export PDF.


## Decision

#### Possibilité 1
Les solutions pure front ont dû être vite écartées. Elles nécessiteraient de la duplication de code si le fichier est disponible sur plusieurs app et rendrait donc l'outil difficilement maintenable.
Surtout que les bibliothèques qui transforment du html en pdf (html2canvas + pdfKit), font une capture "statique" du html (jpg) puis l'incluent dans un canvas sur le HTML. 
On perd donc la copie/recherche de texte, le lien hypertexte mais aussi des fonctionnalités avancées tel que la signature numérique du document.
⛔️ Cette solution a donc été tout de suite écartée.

#### Possibilité 2
Les solutions SaaS telles que [pdfgeneratorapi](https://pdfgeneratorapi.com/) ou [docraptor](https://docraptor.com/how-it-works) sont clé en main ce qui est très avantageux.
En revanche l'aspect sécurité est un gros problème. Où sont stockées les données, les niveaux de sécurités sont ils adaptés ?
Le coût est aussi un point négatif (on aura probablement 1 400 000 attestations qui pourraient être téléchargées sur l'année).

#### Possibilité 3
Un premier POC a été fait avec [puppeteer](https://github.com/puppeteer/puppeteer), une bibliothèque Node développée par google qui permet d'orchestrer un navigateur web (chrome/chromium) via le chrome dev-tools.
Il est ainsi possible de charger une page web, soit via un url, soit via une page HTML et d'en faire un export PDF via l'API.
Les avantages de cette solution sont :
- côté API (réutilisabilité sur d’autres app front)
- utilisation de templates 100% custom et dynamiques (via _template_ de lodash)
- les devs sont directement opérationnels (HTML+CSS)

Les inconvénients de cette solution sont :
- complexifie l'infrastructure de l'environnement de production (installer puppeteer sur Scalingo demande à toucher l’OS déployé et géré par Scalingo)
```
------------------------------- api/.buildpacks -------------------------------
index 8c42335ce..2a6722a37 100644
@@ -1 +1,2 @@
 https://github.com/Scalingo/nodejs-buildpack
+https://github.com/jontewks/puppeteer-heroku-buildpack.git
 ``` 
- créer un serveur à part serait une solution mais demande un coût de temps et argent
- une page html n'est pas optimisée pour un rendu imprimable (format fixe)

#### Possibilité 4
Une solution auto-hébergée tel que [jsReport](https://jsreport.net/) a été considérée mais nécessite comme puppeteer un serveur à part pour des résultats dont nous ne sommes pas certains.

#### Possibilité 5
Une bibliothèque Node qui va générer directement du PDF

Les avantages :
- pdf natif
- stabilité
- gestion des méta-données
- pas de bibliothèques native spécifique à installer, pas de changement d'infra

Les inconvénients :
- prise en main difficile (pas du HTML)

Plusieurs choix sont possibles :

[PdfKit](https://pdfkit.org/)
Bibliothèque node mature, pas de merge de PDF

[PdfLib](https://www.pdflib.com/documentation/howtos/)
Bibliothèque node plus récente que pdfkit.
On peut merger les pdf.
✅ Cette solution est retenue, elle permettra ainsi d'importer un PDF avec toutes les données fixes et ensuite d'insérer les valeurs dynamiques selon des coordonnées précises.



## Conséquences

Nous sommes conscients que le choix de la bibliothèque _PdfLib_ peut s'avérer contre productif sur le long terme si le document est amené à être plus dynamique.
Pour le moment il n'y a qu'un élément réellement variable (l'obtention ou non du badge cléA et il faut pour cela 2 templates PDF différents avec des coordonnées pour le code de vérification qui vont devoir être recalculées.
Pour autant, il n'est pas nécessaire de créer un nouveau serveur, la solution semble plus stable au moins sur le court terme.
