#language: fr
Fonctionnalité: Gestion des Campagnes

  Contexte:
    Étant donné que je vais sur Pix Orga
    Et que les données de test sont chargées

  Scénario: Je consulte le détail d'une campagne d'évaluation
    Étant donné que je suis connecté à Pix Orga
    Alors je vois 3 campagnes
    Lorsque je recherche une campagne avec le nom "néra"
    Alors je vois 1 campagne
    Lorsque je clique sur "Campagne de la Néra"
    Alors je vois le détail de la campagne "Campagne de la Néra"
    Lorsque je clique sur "Activité"
    Alors je vois 4 participants
    Lorsque je clique sur "Cersei"
    Alors je vois "50 %" comme "Avancement"
    Alors je vois 0 résultats par compétence
    Lorsque je reviens en arrière
    Et je clique sur "Tyrion"
    Alors je vois 2 résultats par compétence
    Lorsque je clique sur "Analyse"
    Alors je vois 2 sujets
    Et je vois que le sujet "Capitales" est "Très recommandé"
    Et je vois que le sujet "Philosophes" est "Assez recommandé"
    Lorsque je clique sur "Campagne de la Néra"
    Et je clique sur "Résultats (1)"
    Alors je vois la moyenne des résultats à 50%
    Lorsque je clique sur "Analyse"
    Alors je vois 2 sujets
    Et je vois que le sujet "Capitales" est "Très recommandé"
    Et je vois que le sujet "Philosophes" est "Assez recommandé"
    Lorsque j'ouvre le sujet "Capitales"
    Alors je vois 1 tutoriel

  Scénario: Je consulte le détail d'une campagne de collecte de profils
    Étant donné que je suis connecté à Pix Orga
    Lorsque je clique sur "Envoi profils Lannister"
    Alors je vois le détail de la campagne "Envoi profils Lannister"
    Lorsque je clique sur "Activité"
    Alors je vois 2 participants
    Lorsque je clique sur "Résultats (0)"
    Alors je vois 0 profils

  Scénario: Je créé une campagne d'évaluation
    Étant donné que je suis connecté à Pix Orga
    Lorsque je clique sur "Créer une campagne"
    Alors je suis redirigé vers la page "creation"
    Lorsque je saisis "Campagne du Nord" dans le champ "Nom de la campagne"
    Et je clique sur "Évaluer les participants"
    Et je saisis "Compétences pour un M" dans le champ "Que souhaitez-vous tester ?"
    Et je clique sur "Compétences pour un Mestre"
    Et je clique sur "Non"
    Et je clique sur "Créer la campagne"
    Alors je vois le détail de la campagne "Campagne du Nord"

  Scénario: Je créé une campagne de collecte de profils
    Étant donné que je suis connecté à Pix Orga
    Lorsque je clique sur "Créer une campagne"
    Alors je suis redirigé vers la page "creation"
    Lorsque je saisis "Campagne de l'Ouest" dans le champ "Nom de la campagne"
    Et je clique sur "Collecter les profils Pix des participants"
    Et je clique sur "Non"
    Et je clique sur "Créer la campagne"
    Alors je vois le détail de la campagne "Campagne de l'Ouest"

  Scénario: J'archive et je désarchive une campagne
    Étant donné que je suis connecté à Pix Orga
    Et je clique sur "Campagne du Mur"
    Et je clique sur "Paramètres"
    Lorsque je clique sur "Archiver"
    Et que je clique sur "Campagnes"
    Et que je clique sur "Archivées"
    Alors je vois 1 campagne
    Lorsque je clique sur "Campagne du Mur"
    Et je clique sur "Paramètres"
    Et que je clique sur "Désarchiver la campagne"
    Et que je clique sur "Campagnes"
    Et que je clique sur "Archivées"
    Alors je vois 0 campagne

  Scénario: Je modifie une campagne
    Étant donné que je suis connecté à Pix Orga
    Et je clique sur "Campagne du Mur"
    Et je clique sur "Paramètres"
    Lorsque je clique sur "Modifier"
    Alors je suis redirigé vers la page "modification"
    Lorsque je saisis "Parcours pour les marcheurs blancs" dans le champ "Titre du parcours"
    Et que je clique sur "Modifier"
    Et que je clique sur "Paramètres"
    Alors je vois le détail de la campagne "Campagne du Mur"
    Et je vois "Parcours pour les marcheurs blancs" comme "Titre du parcours"
