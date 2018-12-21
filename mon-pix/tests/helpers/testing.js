export async function authenticateAsSimpleUser() {
  await visit('/connexion');
  await fillIn('#pix-email', 'jane@acme.com');
  await fillIn('#pix-password', 'Jane1234');
  await click('.signin-form__submit_button');
}

export async function authenticateAsSimpleExternalUser() {
  await visit('/connexion?token=aaa.eyJ1c2VyX2lkIjoxLCJzb3VyY2UiOiJleHRlcm5hbCIsImlhdCI6MTU0NTMyMTQ2OSwiZXhwIjoxNTQ1OTI2MjY5fQ.bbbb');
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

export async function resumeCampaignByCode(campaignCode, hasExternalParticipantId) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.campaign-landing-page__start-button');
  if (hasExternalParticipantId) {
    await fillIn('#id-pix-label', 'monmail@truc.fr');
    await click('.pix-button');
  }
  await click('.campaign-tutorial__ignore-button');
  await click('.challenge-actions__action-skip');
}

export async function completeCampaignByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.challenge-actions__action-skip');
  await click('.challenge-item-warning__confirm-btn');
  await click('.challenge-actions__action-skip');
}
