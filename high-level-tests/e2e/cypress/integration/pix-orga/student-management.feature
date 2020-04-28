#language: fr
Fonctionnalité: Génération du mot de passe à usage unique

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: Je suis un élève et je veux changer mon mot de passe
    Étant donné que je vais sur Pix Orga
    Lorsque je me connecte avec le compte "john.snow@pix.fr"
    Alors je suis redirigé vers le compte Orga de "John Snow"
    Lorsque je clique sur "Élèves"
    Alors je suis redirigé vers la page "/eleves"
    Lorsque je clique sur l'engrenage
    Alors je vois la modal de gestion du compte de l'élève
    Lorsque je clique sur "Réinitialiser le mot de passe"
    Alors je vois le mot de passe généré


