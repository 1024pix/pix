Feature: Gestion des Campagnes

  Background:
    Given les données de test sont chargées

  Scenario: Je me connecte à Pix Orga
    Given je vais sur Pix Orga
    When je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Then je suis redirigé vers le compte Orga de "Daenerys Targaryen"

