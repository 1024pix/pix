#language: fr
Fonctionnalité: Connexion

  Contexte:
    Étant donné que tous les comptes sont créés

  Scénario: Je me connecte puis je me déconnecte en fin de session
    Étant donné que je vais sur Pix
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le profil de "Daenerys"
    Lorsque je me déconnecte
    Alors je suis redirigé vers la page "/connexion"

  Scénario: Je suis connecté et ma session expire puis je rejoins une nouvelle page
    Étant donné que je vais sur Pix
    Lorsque je suis connecté avec un compte dont le token expire bientôt
    Alors je suis redirigé vers le profil de "Daenerys"
    Lorsque j'attends 3000 ms
    Et je vais sur la page "/mes-certifications"
    Alors je suis redirigé vers la page "/connexion"

  Scénario: Je me connecte via un organisme externe puis je me déconnecte
    Lorsque je vais sur Pix via un organisme externe
    Alors je suis redirigé vers le profil de "Daenerys"
    Lorsque je me déconnecte
    Alors je suis redirigé vers la page "/nonconnecte"

  Scénario: Je me connecte via un organisme externe alors qu'il y a une personne déjà connectée puis je me déconnecte
    Étant donné que je suis connecté à Pix en tant que "John Snow"
    Lorsque je vais sur Pix via un organisme externe
    Alors je suis redirigé vers le profil de "Daenerys"
    Lorsque je me déconnecte
    Alors je suis redirigé vers la page "/nonconnecte"
