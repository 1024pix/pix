#language: fr
Fonctionnalité: Connexion - Déconnexion

  Contexte:
    Étant donné que je vais sur Pix Admin
    Et que tous les comptes sont créés

  Scénario: Je me connecte à Pix Admin
    Lorsque je me connecte avec le compte "pixmaster@example.net"
    Alors je vois le titre de la page "Organisations | Pix Admin"
    Lorsque je me déconnecte de Pix Admin
    Alors je vois le titre de la page "Connexion | Pix Admin"
