Feature: Profil-v2

  Background:
    Given les données de test sont chargées

  Scenario: J'accède à la page de détails d'une compétence
    Given je vais sur Pix
    And je suis connecté à Pix
    When j'accède à mon profil v2
    And je clique sur le rond de niveau de la compétence "Traiter des données"
    Then je vois la page de détails de la compétence "Traiter des données"
