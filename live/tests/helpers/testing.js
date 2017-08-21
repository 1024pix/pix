export function authenticateUser() {
  visit('/connexion');
  fillIn('#pix-email', 'samurai.jack@aku.world');
  fillIn('#pix-password', 'B@ck2past');
  click('.signin-form__submit_button');
}
