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

  Scenario: Je termine la démo Communication et collaboration
    Given je vais sur Pix
    When je lance le course "recq1wh5cKtibXDZu"
    Then je suis redirigé vers une page d'épreuve
    When l'épreuve contient le texte "émoticônes"
    Then je passe l'épreuve
    When l'épreuve contient le texte "Parmi ces démarches administratives"
    Then je choisis la réponse "radio_3"
    Then je valide l'épreuve
    When l'épreuve contient le texte "lesquels sont présents sur la page d'accueil"
    Then je passe l'épreuve
    When l'épreuve contient le texte "Voici les informations de partage d'un document."
    Then je passe l'épreuve
    When l'épreuve contient le texte "qui saura que Nathan est en copie de ce courrier électronique ?"
    Then je choisis la réponse "checkbox_4"
    Then je valide l'épreuve
    When l'épreuve contient le texte "Donnez le lien de partage du fichier Les fleurs qu'il contient."
    Then je passe l'épreuve
    When l'épreuve contient le texte "Donnez l’URL du formulaire (au format pdf) à remplir pour le moteur de recherche Qwant."
    Then je passe l'épreuve
