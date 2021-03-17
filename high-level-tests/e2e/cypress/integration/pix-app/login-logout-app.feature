#language: fr
Fonctionnalité: Connexion - Déconnexion

  Contexte:
    Étant donné que tous les comptes sont créés

  Scénario: Je vérifie l'accessibilité des pages de connexion et d'inscription
    Étant donné que je vais sur Pix
    Et que je suis redirigé vers la page "/connexion"
    Alors je vérifie l'accessibilité
    Lorsque je clique sur "Créez un compte"
    Et que je suis redirigé vers la page "/inscription"
    Alors je vérifie l'accessibilité

  Scénario: Je me connecte puis je me déconnecte en fin de session
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers la page d'accueil de "Daenerys"
    Lorsque je me déconnecte
    Alors je suis redirigé vers la page "/connexion"

  Scénario: Je suis connecté et ma session expire puis je rejoins une nouvelle page
    Étant donné que je vais sur Pix
    Lorsque je suis connecté avec un compte dont le token expire bientôt
    Alors je suis redirigé vers la page d'accueil de "Daenerys"
    Lorsque j'attends 3000 ms
    Et je vais sur la page "/mes-certifications"
    Alors je suis redirigé vers la page "/connexion"

  Scénario: Je me connecte via un organisme externe puis je me déconnecte
    Lorsque je me connecte sur Pix pour la seconde fois via le GAR
    Alors je suis redirigé vers la page d'accueil de "Daenerys"
    Lorsque je me déconnecte
    Alors je suis redirigé vers la page "/nonconnecte"
    Et je vérifie l'accessibilité

  Scénario: Je me connecte via un organisme externe alors qu'il y a une personne déjà connectée puis je me déconnecte
    Étant donné que je suis connecté à Pix en tant que "John Snow"
    Lorsque je me connecte sur Pix pour la seconde fois via le GAR
    Alors je suis redirigé vers la page d'accueil de "Daenerys"
    Lorsque je me déconnecte
    Alors je suis redirigé vers la page "/nonconnecte"
