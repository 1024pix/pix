#language: fr
Fonctionnalité: Gestion des élèves

  Contexte:
    Étant donné que je vais sur Pix Orga
    Et que les données de test sont chargées
    Et que je me connecte avec le compte "aemon.targaryen@pix.fr"
    Et que je clique sur "Étudiants"

  Scénario: J'affiche la liste des élèves
    Alors je suis redirigé vers la page "/etudiants"
    Et je vois 1 étudiant
