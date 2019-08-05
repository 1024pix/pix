export async function authenticateAsSimpleUser() {
  await visit('/connexion');
  await fillIn('#email', 'jane@acme.com');
  await fillIn('#password', 'Jane1234');
  await click('.button');
}

export async function authenticateAsSimpleProfileV2User() {
  await visit('/connexion');
  await fillIn('#email', 'jane-profilev2@acme.com');
  await fillIn('#password', 'Jane1234');
  await click('.button');
}

export async function authenticateAsSimpleExternalUser() {
  await visit('/?token=aaa.' + btoa('{"user_id":3,"source":"external","iat":1545321469,"exp":4702193958}') + '.bbb');
}

export async function authenticateAsPrescriber() {
  await visit('/connexion');
  await fillIn('#email', 'john@acme.com');
  await fillIn('#password', 'John1234');
  await click('.button');
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
    await click('.button');
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

export async function completeCampaignAndSeeResultsByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.challenge-actions__action-skip');
  await click('.challenge-item-warning__confirm-btn');
  await click('.challenge-actions__action-skip');
  await click('.checkpoint__continue-button');
}
