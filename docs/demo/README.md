# Demo — liste-etablissements

## Fichier
- `liste-etablissements.csv` — 60 établissements + 1 ligne de total
- `liste-etablissements.xlsx` — même contenu (2 feuilles : Établissements + Légende)

> Note : le fichier `.xlsx` est binaire et n'est pas versionné dans ce dépôt.
> Générer depuis le CSV avec un outil tiers (ex. LibreOffice, Python openpyxl).

## Erreurs semées

| Ligne | Champ | Valeur erronée | Valeur correcte |
|-------|-------|----------------|-----------------|
| 10 | equipe | Team Alfa | Team Alpha |
| 15 | equipe | Team Alfa | Team Alpha |
| 26 | equipe | Team Alfa | Team Alpha |
| 33 | equipe | Team Alfa | Team Alpha |
| 44 | equipe | Team Alfa | Team Alpha |
| 55 | equipe | Team Alfa | Team Alpha |
| 33+55 | identifiant_externe | ORG-033 (doublon) | — |

## Chiffres attendus

- Simulation initiale : **54 prêts / 6 en erreur** (erreurs = Team Alfa)
- Après corrections + ré-simulation : **59 prêts / 1 exclu** (ligne 61 exclue)
- Exécution : **59 créées**
- Scénario d'échec au 7e : **6 créées / 1 échec / 52 restantes / 1 exclue**

## Ligne 50

La ligne 50 n'est jamais dans le sommaire (5 premières + 3 dernières). Vérifier que la liste
"lignes lues par l'assistant" sous le tableau ne mentionne jamais L50 lors d'une démo normale.
