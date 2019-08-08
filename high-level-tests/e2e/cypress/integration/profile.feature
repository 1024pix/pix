Feature: Profil

  Background:
    Given les données de test sont chargées

  Scenario: J'accède à la page de détails d'une compétence
    Given je vais sur Pix
    And je suis connecté à Pix en tant que "Daenerys Targaryen"
    When j'accède à mon profil
    And je clique sur le rond de niveau de la compétence "Traiter des données"
    Then je vois la page de détails de la compétence "Traiter des données"
