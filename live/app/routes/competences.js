import Ember from 'ember';
import BaseRoute from 'pix-live/routes/base-route';

const domains = [{
  id: 'information-et-donnees',
  title: 'Informations et données',
  topics: [{
    title: 'Mener une recherche et une veille d’information',
    description: 'Mener une recherche et une veille d’information pour répondre à un besoin d’information et se tenir au courant de l’actualité d’u sujet (avec un moteur de recherche, au sein d’un réseau social, par abonnement à des flux ou des lettres d’information, ou tout autre moyen.)',
    themes: 'Web et navigation ; Moteur de recherche et requête ; Veille d’information, flux encuration ; Evaluation de l’information ; Source et citation ; Gouvernance d’internet et ouverture du web ; Abondance de l’information, filtrage et personnalisation ; Recul critique face à l’information et aux médias ; Droit d’auteur.'
  }, {
    title: 'Gérer des données',
    description: 'Stocker et organiser des données pour les retrouver, les conserver et en faciliter l’accès et la gestion (avec un gestionnaire de fichiers, un espace de stockage en ligne, des tags, des classeurs, des bases de données, un système d’information, etc.).',
    themes: 'Dossier et fichier ; Stockage et compression ; Transfert et synchronisation ; Recherche et méta-données ; Indexation sémantique et libellé (tag) ; Structuration des données ; Système d’information ; Localisation des données et droit applicable ; Modèles et stratégies économiques ; Sécurité du système d’information.'
  }, {
    title: 'Traiter des données',
    description: 'Appliquer des traitements à des données pour les analyser et les interpréter (avec un tableur, un programme, un logiciel de traitement d’enquête, une requête calcul dans une base de données, etc.).',
    themes: 'Dossier et fichier ; Stockage et compression ; Transfert et synchronisation ; Recherche et méta-données ; Indexation sémantique et libellé (tag) ; Structuration des données ; Système d’information ; Localisation des données et droit applicable ; Modèles et stratégies économiques ; Sécurité du système d’information.'
  }]
}, {
  id: 'communication-et-collaboration',
  title: 'Communication et collaboration',
  topics: [{
    title: 'Interagir',
    description: 'Interagir avec des individus et de petits groupespour échanger dans divers contextes liés à la vie privée ou à une activité professionnelle, de façon ponctuelle et récurrente (avec une messagerie électronique, une messagerie instantanée, un système de visio-conférence, etc.).',
    themes: 'Protocoles pour l\'interaction ; Modalités d\'interaction et rôles ; Applications et services pour l\'interaction ; Vie privée et confidentialité ; Identité numérique et signaux ; Vie connectée ; Codes de communication et netiquette'
  }, {
    title: 'Partager et publier',
    description: 'Partager et publier des informations et des contenus pour communiquer ses propres productions ou opinions, relayer celles des autres en contexte de communication publique(avec des plateformes de partage, des réseaux sociaux, des blogs, des espaces de forum et de commentaire, des CMS, etc.).',
    themes: 'Protocoles et modalités de partage ; Applications et services pour le partage ; Règles de publication et visibilité ; Réseaux sociaux ; Liberté d\'expression et droit à l\'information ; Formation en ligne ; Vie privée et confidentialité ; Identité numérique et signaux ; Pratiques sociales et participation citoyenne ; e- Réputation et influence ; Ecriture pour le web ; Codes de communication et netiquette ; Droit d\'auteur'
  }, {
    title: 'Collaborer',
    description: 'Collaborer dans un groupe pour réaliser un projet, co-produire des ressources, des connaissances, des données, et pour apprendre (avec des plateformes de travail collaboratif et de partage de document, des éditeurs en ligne, des fonctionnalités de suivi de modifications ou de gestion de versions, etc.).',
    themes: 'Modalités de collaboration et rôles ; Applications et services de partage de document et d\'édition en ligne ; Versions et révisions ; Droits d\'accès et conflit d\'accès ; Gestion de projet ; Droit d\'auteur ; Vie connectée ; Vie privée et confidentialité'
  }, {
    title: 'S\'insérer dans le monde numérique',
    description: 'Maîtriser les stratégies et enjeux de la présence en ligne, et choisir ses pratiques pour se positionner en tant qu\'acteur social, économique et citoyen dans le monde numérique, en lien avec ses règles, limites et potentialités, et en accord avec des valeurs et/ou pour répondre à des objectifs (avec les réseaux sociaux et les outils permettant de développer une présence publique sur le web, et en lien avec la vie citoyenne, la vie professionnelle, la vie privée, etc.).',
    themes: 'Identité numérique et signaux ; e-Réputation et influence ; Codes de communication et netiquette ; Pratiques sociales et participation citoyenne ; Modèles et stratégies économiques ; Questions éthiques et valeurs ; Gouvernance d\'internet et ouverture du web ; Liberté d\'expression et droit à l\'information'
  }]
}, {
  id: 'creation-de-contenu',
  title: 'Création de contenu',
  topics: [{
    title: 'Développer des documents textuels',
    description: 'Produire des documents à contenu majoritairement textuel pour communiquer des idées, rendre compte et valoriser ses travaux (avec des logiciels de traitement de texte, de présentation, de création de page web, de carte conceptuelle, etc.).',
    themes: 'Applications d\'édition de documents textuels ; Structure et séparation forme et contenu ; Illustration et intégration ; Charte graphique et identité visuelle ; Interopérabilité ; Ergonomie et réutilisabilité du document ; Accessibilité ; Droit d\'auteur'
  }, {
    title: 'Développer des documents multimédia',
    description: 'Développer des documents à contenu multimédia pour créer ses propres productions multimédia, enrichir ses créations majoritairement textuelles ou créer une oeuvre transformative (mashup, remix, ...) (avec des logiciels de capture et d\'édition d\'image / son / vidéo / animation, des logiciels utiles aux pré-traitements avant intégration, etc.).',
    themes: 'Applications d\'édition de documents multimédia ; Capture son, image et vidéo et numérisation ; Interopérabilité ; Accessibilité ; Droit d\'auteur ; Charte graphique et identité visuelle'
  }, {
    title: 'Adapter les documents à leur finalité',
    description: 'Adapter des documents de tous types en fonction de l\'usage envisagé et maîtriser l\'usage des licences pour permettre, faciliter et encadrer l\'utilisation dans divers contextes (mise à jour fréquente, diffusion multicanale, impression, mise en ligne, projection, etc.) (avec les fonctionnalités des logiciels liées à la préparation d\'impression, de projection, de mise en ligne, les outils de conversion de format, etc.).',
    themes: 'Licences ; Diffusion et mise en ligne d\'un document Ergonomie et réutilisabilité du document ; Ecriture pour le web ; Interopérabilité ; Accessibilité ; Vie privée et confidentialité'
  }, {
    title: 'Programmer',
    description: 'Ecrire des programmes et des algorithmes pour répondre à un besoin (automatiser une tâche répétitive, accomplir des tâches complexes ou chronophages, résoudre un problème logique, etc.) et pour développer un contenu riche (jeu, site web, etc.) (avec des environnements de développement informatique simples, des logiciels de planification de tâches, etc.).',
    themes: 'Algorithme et programme ; Représentation et codage de l\'information ; Complexité ; Pensée algorithmique et informatique ; Collecte et exploitation de données massives ; Intelligence artificielle et robots'
  }]
}, {
  id: 'protection-et-securite',
  title: 'Protection et sécurité',
  topics: [{
    title: 'Sécuriser l\'environnement numérique',
    description: 'Sécuriser les équipements, les communications et les données pour se prémunir contre les attaques, pièges, désagréments et incidents susceptibles de nuire au bon fonctionnement des matériels, logiciels, sites internet, et de compromettre les transactions et les données (avec des logiciels de protection, des techniques de chiffrement, la maîtrise de bonnes pratiques, etc.).',
    themes: 'Attaques et menaces ; Chiffrement ; Logiciels de prévention et de protection ; Authentification ; Sécurité du système d\'information ; Vie privée et confidentialité'
  }, {
    title: 'Protéger les données personnelles et la vie privée',
    description: 'Maîtriser ses traces et gérer les données personnelles pour protéger sa vie privée et celle des autres, et adopter une pratique éclairée (avec le paramétrage des paramètres de confidentialité, la surveillance régulière de ses traces par des alertes ou autres outils, etc.).',
    themes: 'Données personnelles et loi ; Traces ; Vie privée et confidentialité ; Collecte et exploitation de données massives'
  }, {
    title: 'Protéger la santé, le bien-être et l\'environnement',
    description: 'Prévenir et limiter les risques générés par le numérique sur la santé, le bien- être et l\'environnement mais aussi tirer parti de ses potentialités pour favoriser le développement personnel, le soin, l\'inclusion dans la société et la qualité des conditions de vie, pour soi et pour les autres (avec la connaissance des effets du numérique sur la santé physique et psychique et sur l\'environnement, et des pratiques, services et outils numériques dédiés au bien-être, à la santé, à l\'accessibilité)',
    themes: 'Ergonomie du poste de travail ; Communication sans fil et ondes ; Impact environnemental ; Accessibilité ; Vie connectée ; Capteurs ; Intelligence artificielle et robots ; Santé ; Vie privée et confidentialité'
  }]
}, {
  id: 'environnement-numerique',
  title: 'Environnement numérique',
  topics: [{
    title: 'Résoudre des problèmes techniques',
    description: 'Résoudre des problèmes techniques pour garantir et rétablir le bon fonctionnement d\'un environnement informatique (avec les outils de configuration et de maintenance des logiciels ou des systèmes d\'exploitation, et en mobilisant les ressources techniques ou humaines nécessaires, etc.).',
    themes: 'Panne et support informatique ; Administration et configuration ; Maintenance et mise à jour ; Sauvegarde et restauration ; Interopérabilité ; Complexité'
  }, {
    title: 'Construire un environnement numérique',
    description: 'Installer, configurer et enrichir un environnement numérique (matériels, outils, services) pour disposer d\'un cadre adapté aux activités menées, à leur contexte d\'exercice ou à des valeurs (avec les outils de configuration des logiciels et des systèmes d\'exploitation, l\'installation de nouveaux logiciels ou la souscription à des services, etc.).',
    themes: 'Histoire de l\'informatique ; Informatique et matériel ; Logiciels, applications et services ; Système d\'exploitation ; Réseau informatique ; Offre (matériel, logiciel, service) ; Modèles et stratégies économiques'
  }]
}];

export default BaseRoute.extend({

  panelActions: Ember.inject.service(),

  model() {
    return domains;
  }

});
