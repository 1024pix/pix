Feature: Preview

  Background:
    Given les données de test sont chargées

  Scenario: Je peux voir la prévisualisation d'une question
    Given je vais sur Pix
    And je suis connecté à Pix en tant qu'administrateur
    When je lance la preview du challenge "reckOAMc6UyX74W1x"
    Then je suis redirigé vers une page d'épreuve
    Then l'épreuve contient le texte "lesquels contiennent des données personnelles"

