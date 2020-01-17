Feature: Titre des pages

  Scenario: j'accède à la page de connexion
    When je vais sur la page de connexion
    Then je vois le titre de la page "Connexion | Pix"

  Scenario: j'accède à la page profil
    Given tous les comptes sont créés
    And je vais sur Pix
    And je suis connecté à Pix en tant que "Daenerys Targaryen"
    When j'accède à mon profil
    Then je vois le titre de la page "Votre profil | Pix"

  Scenario: j'accède à la page compétence
    Given tous les comptes sont créés
    And je vais sur Pix
    And je suis connecté à Pix en tant que "Daenerys Targaryen"
    When je vais sur la compétence "recH9MjIzN54zXlwr"
    Then je vois le titre de la page "Compétence | Mathématiques | Pix"
