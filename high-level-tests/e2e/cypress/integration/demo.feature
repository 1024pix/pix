Feature: Demo

  Scenario: Je lance une démo pour Protection et sécurité
    Given je vais sur Pix
    When je lance le course "recboy5Db4p4wy6AN"
    Then je suis redirigé vers une page d'épreuve
    And le titre sur l'épreuve est "Protection"

  Scenario: Je lance une démo pour Création de contenu
    Given je vais sur Pix
    When je lance le course "recvPKiqKKHipEOjK"
    Then je suis redirigé vers une page d'épreuve
    And le titre sur l'épreuve est "Création"

  Scenario: Je lance une démo pour Communication et collaboration
    Given je vais sur Pix
    When je lance le course "recq1wh5cKtibXDZu"
    Then je suis redirigé vers une page d'épreuve
    And le titre sur l'épreuve est "Communication"

  Scenario: Je lance une démo pour Information et données
    Given je vais sur Pix
    When je lance le course "rec8rnpOgmfZyd2Ng"
    Then je suis redirigé vers une page d'épreuve
    And le titre sur l'épreuve est "Information"

  Scenario: Je commence la démo Communication et collaboration
    Given je vais sur Pix
    When je lance le course "recq1wh5cKtibXDZu"
    Then je suis redirigé vers une page d'épreuve
    When l'épreuve contient le texte "émoticônes"
    Then je passe l'épreuve
    When l'épreuve contient le texte "Parmi ces démarches administratives"
    Then je choisis la réponse "radio_3"
    Then je valide l'épreuve
