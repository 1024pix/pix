#language: fr
Fonctionnalité: Affichage des pages en tant que membre

  Contexte:
    Étant donné que je vais sur Pix Orga
    Et que les données de test sont chargées

  Scénario: J'affiche la liste des élèves
    Lorsque je me connecte avec le compte "alex.terieur@pix.fr"
    Et que je clique sur "Élèves"
    Alors je suis redirigé vers la page "/eleves"
    Et je vois 3 élèves

  Scénario: J'affiche la liste des étudiants
    Lorsque je me connecte avec le compte "alain.terieur@pix.fr"
    Et que je clique sur "Étudiants"
    Alors je suis redirigé vers la page "/etudiants"
    Et je vois 1 étudiant
