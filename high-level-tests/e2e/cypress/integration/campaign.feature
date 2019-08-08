Feature: Campagne

  Background:
    Given les données de test sont chargées

  Scenario: Je commence mon parcours prescrit
    Given je vais sur Pix
    And je suis connecté à Pix en tant que "Daenerys Targaryen"
    When je vais sur la campagne "NERA"
    Then je vois la page de "presentation" de la campagne
    When je clique sur "Je commence"
    Then je vois la page de "didacticiel" de la campagne
