export async function authenticateAsSimpleUser() {
  await visit('/connexion');
  await fillIn('#pix-email', 'jane@acme.com');
  await fillIn('#pix-password', 'Jane1234');
  await click('.signin-form__submit_button');
}

export async function authenticateAsPrescriber() {
  await visit('/connexion');
  await fillIn('#pix-email', 'john@acme.com');
  await fillIn('#pix-password', 'John1234');
  await click('.signin-form__submit_button');
}

export async function logout() {
  await visit('/deconnexion');
}

export async function startCampaignByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.campaign-landing-page__start-button');
}
