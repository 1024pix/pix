import { click, fillIn } from '@ember/test-helpers';
import visit from './visit';
import { contains } from './contains';

export async function startCampaignByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.campaign-landing-page__start-button');
}

export async function startCampaignByCodeAndExternalId(campaignCode) {
  await visit(`/campagnes/${campaignCode}?participantExternalId=a73at01r3`);
  await click('.campaign-landing-page__start-button');
}

export async function resumeCampaignOfTypeAssessmentByCode(campaignCode, hasExternalParticipantId) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.campaign-landing-page__start-button');
  if (hasExternalParticipantId) {
    await fillIn('#id-pix-label', 'monmail@truc.fr');
    await click('.button');
  }
  await click('.campaign-tutorial__ignore-button');
  await click('.challenge-actions__action-skip');
}

export async function resumeCampaignOfTypeProfilesCollectionByCode(campaignCode, hasExternalParticipantId) {
  await visit(`/campagnes/${campaignCode}`);
  await click(contains('C’est parti !'));
  if (hasExternalParticipantId) {
    await fillIn('#id-pix-label', 'monmail@truc.fr');
    await click(contains('Continuer'));
  }
}

export async function completeCampaignOfTypeProfilesCollectionByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click(contains('J\'envoie mon profil'));
}

export async function completeCampaignOfTypeAssessmentByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.challenge-actions__action-skip');
  await click('.challenge-actions__action-skip');
}

export async function completeCampaignOfTypeAssessmentAndSeeResultsByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.challenge-actions__action-skip');
  await click('.challenge-actions__action-skip');
  await click('.checkpoint__continue-button');
}
