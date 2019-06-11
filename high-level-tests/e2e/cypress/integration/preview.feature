Feature: Preview

  Background:
    Given les données de test sont chargées

  Scenario: Je peux voir la preview d'une question
    Given je vais sur Pix
    And je suis connecté à Pix en tant qu'administrateur
    When je lance la preview du challenge "recboy5Db4p4wy6AN"
    Then je suis redirigé vers une page d'épreuve

