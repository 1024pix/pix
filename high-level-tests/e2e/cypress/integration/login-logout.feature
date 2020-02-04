Feature: Connexion

  Background:
    Given tous les comptes sont créés

  Scenario: Je me connecte puis je me déconnecte en fin de session
    Given je vais sur Pix
    When je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Then je suis redirigé vers le profil de "Daenerys"
    When je me déconnecte
    Then je suis redirigé vers la page "/connexion"

   Scenario: Je me connecte via un organisme externe puis je me déconnecte
     When je vais sur Pix via un organisme externe
     Then je suis redirigé vers le profil de "Daenerys"
     When je me déconnecte
     Then je suis redirigé vers la page "/nonconnecte"

  Scenario: Je me connecte via un organisme externe alors qu'il y a une personne déjà connectée puis je me déconnecte
     Given je suis connecté à Pix en tant que "John Snow"
     When je vais sur Pix via un organisme externe
     Then je suis redirigé vers le profil de "Daenerys"
     When je me déconnecte
     Then je suis redirigé vers la page "/nonconnecte"
