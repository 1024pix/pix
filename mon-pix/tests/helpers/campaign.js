import { click, fillIn } from '@ember/test-helpers';
import visitWithAbortedTransition from './visit';

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
