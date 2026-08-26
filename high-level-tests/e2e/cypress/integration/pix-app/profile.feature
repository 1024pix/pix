#language: fr
Fonctionnalité: Compétences

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: J'accède à la page de détails d'une compétence
    Étant donné que je suis connecté à Pix en tant que "Daenerys Targaryen"
    Lorsque je clique sur "Compétences"
    Alors je suis redirigé vers le profil de "Daenerys"
    Et je clique sur le rond de niveau de la compétence "Géographie"
    Alors je vois la page de détails de la compétence "Géographie"
