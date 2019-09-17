Feature: Campagne

  Background:
    Given les données de test sont chargées

  Scenario: Je commence mon parcours prescrit
    Given je vais sur Pix
    And je suis connecté à Pix en tant que "Daenerys Targaryen"
    When je vais sur la page d'accès à une campagne
    And je saisis "NERA" dans le champ
    When je clique sur "Commencer mon parcours"
    Then je vois la page de "presentation" de la campagne
    When je clique sur "Je commence"
    Then je vois la page de "didacticiel" de la campagne

  Scenario: Je rejoins mon parcours prescrit via l'URL sans être connecté
    Given je vais sur Pix
    When je vais sur la campagne "WALL" avec l'identifiant "1er bataillon"
    Then je vois la page de "presentation" de la campagne
    When je clique sur "Je commence"
    And je clique sur "connectez-vous à votre compte"
    And je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Then je vois la page de "didacticiel" de la campagne
