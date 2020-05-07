#language: fr
Fonctionnalité: Validation des CGU

  Contexte:
    Étant donné que tous les comptes sont créés

  Scénario: Je dois valider les nouvelles conditions d'utilisation
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec le compte "user-who-must-validate-the-last-terms-of-service@example.net"
    Alors je suis redirigé vers la page "/cgu"
    Lorsque j'accepte les CGU de Pix
    Et je clique sur "Je continue"
    Alors je suis redirigé vers la page "/profil"
    Lorsque je me déconnecte
    Et je me connecte avec le compte "user-who-must-validate-the-last-terms-of-service@example.net"
    Alors je suis redirigé vers la page "/profil"
