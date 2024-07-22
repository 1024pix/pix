#language: fr
Fonctionnalité: Accessibilité de Modulix

  Contexte:
    Étant donné que je lance le module "didacticiel-modulix"

  Scénario: Je valide l'accessibilité de la page de détails
    Quand j'attends 500 ms
    Alors la page devrait être accessible

  Scénario: Je valide l'accessibilité des pages de passage et de recap
    Quand je clique sur "Commencer le module"
    Et que j'attends 500 ms
    Alors la page de "passage" devrait s'afficher
    Quand je vais au grain suivant
    Quand je vais au grain suivant
    Quand je vais au grain suivant
    Quand je vais au grain suivant
    Quand je vais au grain suivant
    Quand je vais au grain suivant
    Quand je vais au grain suivant
    Quand je vais au grain suivant
    Alors la page devrait être accessible
    Quand je clique sur "Terminer"
    Et que j'attends 500 ms
    Alors la page de "recap" devrait s'afficher
    Et la page devrait être accessible
