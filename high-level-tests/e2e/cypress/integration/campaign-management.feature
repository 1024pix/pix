#language: fr
Fonctionnalité: Gestion des Campagnes

  Contexte:
    Étant donné que je vais sur Pix Orga
    Et que les données de test sont chargées

  Scénario: Je consulte le détail d'une campagne
    Étant donné que je suis connecté à Pix Orga
    Alors je vois 2 campagnes
    Lorsque je recherche une campagne avec le nom "néra"
    Alors la liste est filtrée
    Lorsque je clique sur "Campagne de la Néra"
    Alors je vois le détail de la campagne "Campagne de la Néra"
    Lorsque je clique sur "Participants (3)"
    Alors je vois 3 participants
    Lorsque je clique sur "Cersei"
    Alors je vois un avancement de 50%
    Lorsque je reviens en arrière
    Et je clique sur "Tyrion"
    Alors je vois 2 résultats par compétence
    Lorsque je reviens en arrière
    Et je clique sur "Résultats collectifs"
    Alors je vois la moyenne des résultats à 50%

  Scénario: Je créé une campagne d'évaluation
    Étant donné que je suis connecté à Pix Orga
    Lorsque je clique sur "Créer une campagne"
    Et je saisis "Campagne du Nord" dans le champ "Nom de la campagne"
    Et je clique sur "Évaluer les participants"
    Et je sélectionne "Compétences pour un Mestre" dans le champ "Que souhaitez-vous tester ?"
    Et je clique sur "Non"
    Et je clique sur "Créer la campagne"
    Alors je vois le détail de la campagne "Campagne du Nord"

  Scénario: Je créé une campagne de collecte de profils
    Étant donné que je suis connecté à Pix Orga
    Lorsque je clique sur "Créer une campagne"
    Et je saisis "Campagne de l'Ouest" dans le champ "Nom de la campagne"
    Et je clique sur "Collecter les profils Pix des participants"
    Et je clique sur "Non"
    Et je clique sur "Créer la campagne"
    Alors je vois le détail de la campagne "Campagne de l'Ouest"
