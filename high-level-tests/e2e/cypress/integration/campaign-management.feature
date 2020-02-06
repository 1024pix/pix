Feature: Gestion des Campagnes

  Background:
    Given les données de test sont chargées

  Scenario: Je me connecte à Pix Orga
    Given je vais sur Pix Orga
    When je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Then je suis redirigé vers le compte Orga de "Daenerys Targaryen"

  Scenario: Je consulte le détail d'une campagne
    Given je suis connecté à Pix Orga
    Then je vois la liste des campagnes
    When je recherche une campagne avec le nom "néra"
    Then la liste est filtrée
    When je clique sur la campagne "Campagne de la Néra"
    Then je vois le détail de la campagne "Campagne de la Néra"
