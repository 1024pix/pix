Feature: Connexion

  Background:
    Given tous les comptes sont créés

  Scenario: Je me connecte
    Given je vais sur Pix
    When je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Then je suis redirigé vers le compte de "Daenerys Targaryen"


   Scenario: Je me connecte via un organisme externe
     Given je suis connecté à Pix en tant que "John Snow"
     When je vais sur Pix via un organisme externe
     Then je suis redirigé vers le compte de "Daenerys Targaryen"
