Feature: Demo

  Scenario: Je lance une démo
    Given je vais sur Pix
    When je lance le course "recboy5Db4p4wy6AN"
    Then je suis redirigé vers une page d'épreuve
    And le titre sur l'épreuve est "Protection"
