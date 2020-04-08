#language: fr
Fonctionnalité: Finalisation d'une session de certification

  Contexte:
    Étant donné que je vais sur Pix Certif
    Et que les données de test sont chargées
    Et que je suis connecté à Pix Certif avec le mail "certif.sco@example.net"

  Scénario: Je finalise une session de certification
    Lorsque je clique sur la session de certification dont la salle est "Salle de la session 2"
    Alors je vois les détails d'une session de certification
    Lorsque je clique sur "Finaliser la session"
    Alors je vois le formulaire de finalisation de session de certification
    Et je vois 2 candidats à finaliser
    Lorsque j'oublie de cocher une case d'Écran de fin de test vu
    Lorsque je clique sur le bouton pour finaliser la session
    Alors je vois une modale qui me signale 1 oubli de case Écran de fin test
    Lorsque je clique sur "Annuler"
    Alors je vois le formulaire de finalisation de session de certification
    Lorsque je coche toutes les cases d'Écran de fin de test vu
    Lorsque je clique sur le bouton pour finaliser la session
    Alors je vois une modale qui me signale 0 oubli de case Écran de fin test
    Lorsque je clique sur "Confirmer"
    Alors je vois les détails d'une session de certification
    Et je vois le bouton de finalisation désactivé
