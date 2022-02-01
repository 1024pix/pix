#language: fr
Fonctionnalité: Gestion des membres d'une organisation

  Contexte:
    Étant donné que je vais sur Pix Orga
    Et que les données de test sont chargées

  Scénario: Je rejoins une organisation
    Lorsque je saisis l'URL de l'invitation
    Alors je suis redirigé vers la page pour rejoindre l'organisation
    Lorsque je saisis "Aemon" dans le champ "Prénom"
    Et je saisis "Targaryen" dans le champ "Nom"
    Et je saisis "aemon.targaryen@example.net" dans le champ "Adresse e-mail"
    Et je saisis "Pix_example1" dans le champ "Mot de passe"
    Et j'accepte les CGU de Pix
    Et je clique sur "Je m'inscris"
    Alors je suis redirigé vers la page "cgu"
    Lorsque j'accepte les CGU de Pix Orga
    Alors je suis redirigé vers le compte Orga de "Aemon Targaryen"

  Scénario: Je rejoins une organisation et j'ai déjà un compte
    Lorsque je saisis l'URL de l'invitation
    Alors je suis redirigé vers la page pour rejoindre l'organisation
    Lorsque je clique sur "Se connecter"
    Et je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le compte Orga de "Daenerys Targaryen"

  Scénario: Je rejoins une organisation en étant déjà authentifié
    Lorsque je suis connecté à Pix Orga
    Et je saisis l'URL de l'invitation
    Alors je suis redirigé vers la page pour rejoindre l'organisation

  Scénario: J'envoie une invitation à rejoindre Pix Orga
    Lorsque je suis connecté à Pix Orga
    Et je clique sur "Équipe"
    Alors je vois 1 invitation en attente
    Et je vois 1 membre
    Lorsque j'invite "rhaegar.targaryen@example.net, viserys.targaryen@example.net" à rejoindre l'organisation
    Alors je vois 3 invitations en attente
