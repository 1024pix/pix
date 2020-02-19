#language: fr
Fonctionnalité: Gestion des Campagnes

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: Je me connecte à Pix Orga
    Étant donné que je vais sur Pix Orga
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le compte Orga de "Daenerys Targaryen"

  Scénario: Je consulte le détail d'une campagne
    Étant donné que je suis connecté à Pix Orga
    Alors je vois la liste des campagnes
    Lorsque je recherche une campagne avec le nom "néra"
    Alors la liste est filtrée
    Lorsque je clique sur la campagne "Campagne de la Néra"
    Alors je vois le détail de la campagne "Campagne de la Néra"
