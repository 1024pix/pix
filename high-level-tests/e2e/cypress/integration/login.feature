Feature: Connexion

  Background:
    Given le compte de "Daenerys Targaryen" est créé

  Scenario: Je me connecte
    Given je vais sur Pix
    When je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Then je suis redirigé vers le compte de "Daenerys Targaryen"
