Feature: Campagne

  Background:
    Given les données de test sont chargées

  Scenario: Je rejoins mon parcours prescrit
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

  Scenario: Je rejoins mon parcours prescrit restreint
    Given je vais sur Pix
    And je suis connecté à Pix en tant que "Daenerys Targaryen"
    And je vais sur la page d'accès à une campagne
    When je saisis "WINTER" dans le champ
    And je clique sur "Commencer mon parcours"
    Then je vois la page de "rejoindre" de la campagne
    When je saisis mon prénom "Daenerys"
    When je saisis mon nom "Targaryen"
    When je saisis ma date de naissance 23-10-1986
    And je clique sur "C'est parti !"
    Then je vois la page de "presentation" de la campagne
    When je clique sur "Je commence"
    Then je vois la page de "didacticiel" de la campagne

  Scenario: Je rejoins mon parcours prescrit restreint en étant connecté via un organisme externe
    Given je vais sur Pix via un organisme externe
    And je vais sur la page d'accès à une campagne
    When je saisis "WINTER" dans le champ
    And je clique sur "Commencer mon parcours"
    Then je vois la page de "rejoindre" de la campagne
    When je saisis ma date de naissance 23-10-1986
    And je clique sur "C'est parti !"
    Then je vois la page de "presentation" de la campagne
    When je clique sur "Je commence"
    Then je vois la page de "didacticiel" de la campagne
