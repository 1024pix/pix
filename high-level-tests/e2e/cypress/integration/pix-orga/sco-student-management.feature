#language: fr
Fonctionnalité: Gestion des élèves

  Contexte:
    Étant donné que je vais sur Pix Orga
    Et que les données de test sont chargées
    Et que je me connecte avec le compte "john.snow@pix.fr"
    Et que je clique sur "Élèves"

  Scénario: J'affiche la liste des élèves
    Alors je suis redirigé vers la page "/eleves"
    Et je vois 2 élèves

  Scénario: Je veux changer le mot de passe d'un élève
    Lorsque je veux gérer le compte d'un élève
    Alors je vois la modale de gestion du compte de l'élève
    Lorsque je clique sur "Réinitialiser le mot de passe"
    Alors je vois le mot de passe généré
