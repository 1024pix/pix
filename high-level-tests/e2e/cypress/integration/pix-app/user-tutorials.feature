#language: fr
Fonctionnalité: Connexion - Déconnexion

  Contexte:
    Étant donné que tous les comptes sont créés

  Scénario: Je n'ai pas sauvegardé de tutoriel
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le profil de "Daenerys"
    Lorsque je vais sur la page "/mes-tutos"
    Alors je vois le titre de la page "Mes tutos | Pix"
    Et la page mes-tutos est vide


  Scénario: Je sauvegarde un tutoriel depuis la page de compétence puis le retire
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le profil de "Daenerys"
    Lorsque je clique sur le rond de niveau de la compétence "Mathématiques"
    Et je clique sur "Commencer"
    Et je clique sur "Je passe"
    Et je clique sur "Je passe"
    Et je clique sur "Réponses et tutos"
    Et j‘enregistre le tutoriel "Ne pas confondre le web et Internet"
    Alors le titre du bouton du tutoriel "Ne pas confondre le web et Internet" est "Retirer"
    Et je vais sur la page "/mes-tutos"
    Alors je vois le tutoriel "Ne pas confondre le web et Internet"
    Lorsque je retire le tutoriel "Ne pas confondre le web et Internet"
    Alors la page mes-tutos est vide
