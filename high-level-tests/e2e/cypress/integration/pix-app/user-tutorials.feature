#language: fr
Fonctionnalité: Tutoriels utilisateur

  Contexte:
    Étant donné que tous les comptes sont créés

  Scénario: Je n'ai pas sauvegardé de tutoriel
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le profil de "Daenerys"
    Et la page "Profil" est correctement affichée
    Lorsque je vais sur la page "/mes-tutos"
    Alors je vois le titre de la page "Mes tutos | Pix"
    Et la page mes-tutos est vide
    Et la page "Mes Tutos vide" est correctement affichée


  Scénario: Je sauvegarde un tutoriel depuis la page de compétence puis le retire
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le profil de "Daenerys"
    Et la page "Profil" est correctement affichée
    Lorsque je clique sur le rond de niveau de la compétence "Mathématiques"
    Alors la page "Compétence non commencée" est correctement affichée
    Lorsque je clique sur "Commencer"
    Alors la page "Mathématiques - 1ere question" est correctement affichée
    Lorsque je clique sur "Je passe"
    Alors la page "Mathématiques - 2eme question" est correctement affichée
    Lorsque je clique sur "Je passe"
    Alors la page "Mathématiques - résultat évaluation" est correctement affichée
    Lorsque je clique sur "Réponses et tutos"
    Alors la page "Réponses et tutos" est correctement affichée
    Lorsque je clique sur "Enregistrer" pour le tutoriel "Ne pas confondre le web et Internet"
    Alors le titre du bouton du tutoriel "Ne pas confondre le web et Internet" est "Retirer"
    Alors la page "Réponses et tutos - tuto enregistré" est correctement affichée
    Lorsque je vais sur la page "/mes-tutos"
    Alors je vois le tutoriel "Ne pas confondre le web et Internet"
    Et la page "Mes Tutos - 1 tuto enregistré" est correctement affichée
    Lorsque je clique sur "Retirer" pour le tutoriel "Ne pas confondre le web et Internet"
    Alors la page mes-tutos est vide
    Et la page "Mes Tutos vide" est correctement affichée
