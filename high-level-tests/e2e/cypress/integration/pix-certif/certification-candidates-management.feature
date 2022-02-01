#language: fr
Fonctionnalité: Gestion des candidats inscrits à une session de certification

  Contexte:
    Étant donné que je vais sur Pix Certif
    Et que les données de test sont chargées
    Et que je suis connecté à Pix Certif avec le mail "certif.pro@example.net"
    Lorsque je clique sur la session de certification dont la salle est "Salle de la session 1"
    Et que je clique sur l'onglet des Candidats de la session de certification

  Scénario: Je supprime un candidat de la session de certification
    Étant donné que je clique sur l'onglet des Candidats de la session de certification
    Alors je vois 1 candidat dans le tableau de candidats
    Lorsque je retire un candidat de la liste
    Alors je vois 0 candidat dans le tableau de candidats
