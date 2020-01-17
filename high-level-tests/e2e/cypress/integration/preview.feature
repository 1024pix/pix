Feature: Preview

  Background:
    Given les données de test sont chargées

  Scenario: Je peux voir la prévisualisation d'une question
    Given je vais sur Pix
    And je suis connecté à Pix en tant qu'administrateur
    When je lance la preview du challenge "recc3QU4nKAk4byGv"
    Then je suis redirigé vers une page d'épreuve
    Then l'épreuve contient le texte "Quelle est la capitale de la Lettonie ?"

