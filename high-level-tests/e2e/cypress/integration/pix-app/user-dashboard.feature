#language: fr
Fonctionnalité: Dashboard utilisateur (page /accueil)

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: Je souhaite voir mes parcours non finis et non partagés
    Étant donné que je vais sur Pix
    Et je suis connecté à Pix en tant que "Jaime Lannister"
    Lorsque je vais sur mon dashboard
    Alors je vois le résumé de mes participations aux campagnes qui ne sont pas partagées
    Et je vois 2 participations aux campagnes
    Et je vois le bandeau de reprise de la dernière campagne de collecte de profil non partagée
