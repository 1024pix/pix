Feature: Inscription

  Scenario: Je m'inscris
    Given je vais sur l'inscription de Pix
    When je m'inscris avec le prénom "Michel", le nom "Jacqueson", le mail "mj@example.net" et le mot de passe "Pix_example1"
    Then je suis redirigé vers le profil de "Michel"
