#language: fr
Fonctionnalité: Titre des pages

  Scénario: j'accède à la page de connexion
    Lorsque je vais sur la page de connexion
    Alors je vois le titre de la page "Connexion | Pix"

  Scénario: j'accède à la page profil
    Étant donné que tous les comptes sont créés
    Et je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Lorsque je clique sur "Compétences"
    Alors je vois le titre de la page "Compétences | Pix"

  Scénario: j'accède à la page compétence
    Étant donné que tous les comptes sont créés
    Et je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Lorsque je vais sur la compétence "recH9MjIzN54zXlwr"
    Alors je vois le titre de la page "Mathématiques | Compétence | Pix"

  Scénario: j'accède à une épreuve
    Étant donné que tous les comptes sont créés
    Et je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Lorsque je vais sur la compétence "recH9MjIzN54zXlwr"
    Lorsque je clique sur "Commencer"
    Alors je vois le titre de la page "Mode libre - Question 1 sur 5 | Mathématiques | Pix"
