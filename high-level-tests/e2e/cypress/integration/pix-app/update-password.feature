#language: fr
Fonctionnalité: Mise à jour du mot de passe temporaire

  Contexte:
    Étant donné que tous les comptes sont créés

  Scénario: Je peux changer mon mot de passe et je me retrouve sur mon profil
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec un mot de passe temporaire
    Alors je suis redirigé vers la page de mise à jour de mot de passe
    Lorsque je remplis le formulaire avec un nouveau mot de passe
    Alors je suis redirigé sur mon profil
