export function authenticateAsSimpleUser() {
  visit('/connexion');
  fillIn('#pix-email', 'jane@acme.com');
  fillIn('#pix-password', 'Jane1234');
  click('.signin-form__submit_button');
}

export function authenticateAsPrescriber() {
  visit('/connexion');
  fillIn('#pix-email', 'john@acme.com');
  fillIn('#pix-password', 'John1234');
  click('.signin-form__submit_button');
}

