#language: fr
Fonctionnalité: Connexion - Déconnexion

  Contexte:
    Étant donné que je vais sur Pix Orga
    Et que les données de test sont chargées

  Scénario: Je me connecte à Pix Orga
    Lorsque je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je suis redirigé vers le compte Orga de "Daenerys Targaryen"
    Lorsque je me déconnecte de Pix Orga
    Alors je suis redirigé vers la page "/connexion"
