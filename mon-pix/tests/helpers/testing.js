import { click, fillIn } from '@ember/test-helpers';
import visitWithAbortedTransition from './visit';

export async function authenticateAsSimpleUser() {
  await visitWithAbortedTransition('/connexion');
  await fillIn('#email', 'jane@acme.com');
  await fillIn('#password', 'Jane1234');
  await click('.button');
}

export async function authenticateAsSimpleExternalUser() {
  await visitWithAbortedTransition('/?token=aaa.' + btoa('{"user_id":3,"source":"external","iat":1545321469,"exp":4702193958}') + '.bbb');
}

export async function authenticateAsPrescriber() {
  await visitWithAbortedTransition('/connexion');
  await fillIn('#email', 'john@acme.com');
  await fillIn('#password', 'John1234');
  await click('.button');
}

export async function logout() {
  await visitWithAbortedTransition('/deconnexion');
}

export async function startCampaignByCode(campaignCode) {
  await visitWithAbortedTransition(`/campagnes/${campaignCode}`);
  await click('.campaign-landing-page__start-button');
}

export async function startCampaignByCodeAndExternalId(campaignCode) {
  await visitWithAbortedTransition(`/campagnes/${campaignCode}?participantExternalId=a73at01r3`);
  await click('.campaign-landing-page__start-button');
}

export async function resumeCampaignByCode(campaignCode, hasExternalParticipantId) {
  await visitWithAbortedTransition(`/campagnes/${campaignCode}`);
  await click('.campaign-landing-page__start-button');
  if (hasExternalParticipantId) {
    await fillIn('#id-pix-label', 'monmail@truc.fr');
    await click('.button');
  }
  await click('.campaign-tutorial__ignore-button');
  await click('.challenge-actions__action-skip');
}

export async function completeCampaignByCode(campaignCode) {
  await visitWithAbortedTransition(`/campagnes/${campaignCode}`);
  await click('.challenge-actions__action-skip');
  await click('.challenge-item-warning__confirm-btn');
  await click('.challenge-actions__action-skip');
}

export async function completeCampaignAndSeeResultsByCode(campaignCode) {
  await visitWithAbortedTransition(`/campagnes/${campaignCode}`);
  await click('.challenge-actions__action-skip');
  await click('.challenge-item-warning__confirm-btn');
  await click('.challenge-actions__action-skip');
  await click('.checkpoint__continue-button');
}
