#language: fr
Fonctionnalité: Connexion - Déconnexion de Pix Certif

  Contexte:
    Étant donné que je vais sur Pix Certif
    Et que les données de test sont chargées

  Scénario: Je me connecte à Pix Certif
    Lorsque je me connecte avec le compte "certif.sco@example.net"
    Alors je suis redirigé vers le compte Certif de "Certif Sco"
    Et je vois la liste des sessions de certification
    Lorsque je me déconnecte de Pix Certif
    Alors je suis redirigé vers la page "/connexion"
