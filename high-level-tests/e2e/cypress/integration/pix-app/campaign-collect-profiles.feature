#language: fr
Fonctionnalité: Campagne de collecte de profils

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: Je partage mon profil
    Étant donné que je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Lorsque je vais sur la page d'accès à une campagne
    Et je saisis "LION" dans le champ "Saisissez le code du parcours"
    Lorsque je clique sur "Commencer mon parcours"
    Alors je vois la page de "presentation" de la campagne
    Et la page "Presentation campagne collecte profils" est correctement affichée
    Lorsque je clique sur "C’est parti !"
    Alors je vois la page d'"envoi-profil" de la campagne
    Lorsque je clique sur "J'envoie mon profil"
    Alors je vois que j'ai partagé mon profil

  Scénario: Je partage mon profil via l'URL sans être connecté
    Étant donné que je vais sur Pix
    Lorsque je vais sur la campagne "LION" avec l'identifiant "1er bataillon"
    Alors je vois la page de "presentation" de la campagne
    Lorsque je clique sur "C’est parti !"
    Et je clique sur "connectez-vous à votre compte"
    Et je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je vois la page d'"envoi-profil" de la campagne
    Lorsque je clique sur "J'envoie mon profil"
    Alors je vois que j'ai partagé mon profil

  Scénario: Je partage mon profil de manière restreinte
    Étant donné que je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Et je vais sur la page d'accès à une campagne
    Lorsque je saisis "WOLF" dans le champ "Saisissez le code du parcours"
    Et je clique sur "Commencer mon parcours"
    Alors je vois la page de "rejoindre" de la campagne
    Lorsque je saisis "Daenerys" dans le champ "Prénom"
    Et je saisis "Targaryen" dans le champ "Nom"
    Et je saisis la date de naissance 23-10-1986
    Et je clique sur "C'est parti !"
    Alors je vois la page de "presentation" de la campagne
    Lorsque je clique sur "C’est parti !"
    Alors je vois la page d'"envoi-profil" de la campagne
    Lorsque je clique sur "J'envoie mon profil"
    Alors je vois que j'ai partagé mon profil

  Scénario: Je partage mon profil de manière restreinte en étant connecté via un organisme externe
    Étant donné que je vais sur Pix via un organisme externe
    Et je vais sur la page d'accès à une campagne
    Lorsque je saisis "WOLF" dans le champ "Saisissez le code du parcours"
    Et je clique sur "Commencer mon parcours"
    Alors je vois la page de "rejoindre" de la campagne
    Lorsque je saisis la date de naissance 23-10-1986
    Et je clique sur "C'est parti !"
    Alors je vois la page de "presentation" de la campagne
    Lorsque je clique sur "C’est parti !"
    Alors je vois la page d'"envoi-profil" de la campagne
    Lorsque je clique sur "J'envoie mon profil"
    Alors je vois que j'ai partagé mon profil
