#language: fr
Fonctionnalité: Gestion d'une Organisation

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: Je veux répondre à une invitation pour rejoindre mon organisation même si je suis déjà authentifié
    Étant donné que je vais sur Pix Orga
    Lorsque je suis connecté à Pix Orga
    Alors je vois le menu Équipe
    Lorsque je saisis l'URL de l'invitation 1 ayant le code "ABCDEFGHI5"
    Alors je suis redirigé vers la page Rejoindre l'organisation
