#language: fr
Fonctionnalité: Profil

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: J'accède à la page de détails d'une compétence
    Étant donné que je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Lorsque j'accède à mon profil
    Et je clique sur le rond de niveau de la compétence "Géographie"
    Alors je vois la page de détails de la compétence "Géographie"
