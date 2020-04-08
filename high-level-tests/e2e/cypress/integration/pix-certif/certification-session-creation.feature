#language: fr
Fonctionnalité: Création d'une session de certification

  Contexte:
    Étant donné que je vais sur Pix Certif
    Et que les données de test sont chargées
    Et que je suis connecté à Pix Certif avec le mail "certif.sco@example.net"

  Scénario: Je confirme la création d'une session de certification
    Lorsque je clique sur "Créer une session"
    Alors je vois le formulaire de création de session de certification
    Lorsque je remplis le formulaire de création de session de certification
    Et je clique sur "Créer la session"
    Alors je vois les détails d'une session de certification
    Lorsque je clique sur le bouton de retour de la page de détails d'une session
    Alors je vois la liste des sessions de certification
    Et je vois 3 sessions de certification dans la liste
