#language: fr
Fonctionnalité: Gestion des candidats inscrits à une session de certification

  Contexte:
    Étant donné que je vais sur Pix Certif
    Et que les données de test sont chargées
    Et que je suis connecté à Pix Certif avec le mail "certif.sco@example.net"
    Lorsque je clique sur la session de certification dont la salle est "Salle de la session 1"
    Et que je clique sur l'onglet des Candidats de la session de certification

  Scénario: J'ajoute un candidat à la session de certification
    Étant donné que je clique sur l'onglet des Candidats de la session de certification
    Alors je vois la page des candidats de certification
    Et je vois 1 candidat dans le tableau de candidats
    Lorsque je clique sur "Ajouter un candidat"
    Alors je vois un formulaire d'ajout de candidat apparaître en haut du tableau de candidats
    Lorsque j'ajoute un candidat
    Alors je vois 2 candidats dans le tableau de candidats

  Scénario: Je supprime un candidat de la session de certification
    Étant donné que je clique sur l'onglet des Candidats de la session de certification
    Alors je vois 1 candidat dans le tableau de candidats
    Lorsque je retire un candidat de la liste
    Alors je vois 0 candidat dans le tableau de candidats
