Feature: Demo

  Scenario: Je lance une démo
    Given je vais sur Pix
    When je lance le course "rec5UecGJn0kr2odZ"
    Then je suis redirigé vers une page d'épreuve
    And le titre sur l'épreuve est "Démo essentiels"
    When l'épreuve contient le texte "Combien font 2 + 2 ?"
    And je clique sur "Je passe"
    And l'épreuve contient le texte "Quel mot est synonyme de"
    And je choisis la réponse "radio_3"
    And je clique sur "Je valide"
    And l'épreuve contient le texte "quel est le verbe ?"
    And je saisis "manger" dans le champ
    And je clique sur "Je valide"
    Then je vois la page de résultats
    And j'ai passé à "Combien font 2 + 2 ?"
    And j'ai mal répondu à "Quel mot est synonyme de"
    And j'ai bien répondu à "quel est le verbe ?"
