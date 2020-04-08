#language: fr
Fonctionnalité: Modification d'une session de certification

  Contexte:
    Étant donné que je vais sur Pix Certif
    Et que les données de test sont chargées
    Et que je suis connecté à Pix Certif avec le mail "certif.sco@example.net"

  Scénario: Je confirme la modification d'une session de certification
    Lorsque je clique sur la session de certification dont la salle est "Salle de la session 1"
    Alors je vois les détails d'une session de certification
    Lorsque je clique sur "Modifier"
    Alors je vois le formulaire de modification de session de certification
    Lorsque je modifie l'adresse de la session de certification avec la valeur "Chemin des églantines"
    Et je clique sur "Modifier la session"
    Alors je vois les détails d'une session de certification
    Et je lis la valeur "Chemin des églantines" à l'emplacement de l'adresse de la session
    Lorsque je clique sur le bouton de retour de la page de détails d'une session
    Alors je vois la liste des sessions de certification
    Et je vois 2 sessions de certification dans la liste
