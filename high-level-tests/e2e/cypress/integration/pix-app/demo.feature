#language: fr
Fonctionnalité: Demo

  Scénario: Je lance une démo
    Étant donné que je vais sur Pix
    Lorsque je lance le course "rec5UecGJn0kr2odZ"
    Alors je suis redirigé vers une page d'épreuve
    Et le titre sur l'épreuve est "Démo essentiels"
    Lorsque je vois l'épreuve "Combien font 2 + 2 ?"
    Et je clique sur "Je passe"
    Et je vois l'épreuve "Quel mot est synonyme de « regarder » ?"
    Et je choisis la réponse "radio_3"
    Et je clique sur "Je valide"
    Et je vois l'épreuve "quel est le verbe ?"
    Et je saisis "manger" dans le champ "Réponse :"
    Et je clique sur "Je valide"
    Alors je vois la page de résultats
    Et j'ai passé à "Combien font 2 + 2 ?"
    Et j'ai mal répondu à "Quel mot est synonyme de « regarder » ?"
    Et j'ai bien répondu à "quel est le verbe ?"
