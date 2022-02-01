import { click, fillIn } from '@ember/test-helpers';
import visit from './visit';
import { clickByLabel } from './click-by-label';

export async function startCampaignByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await click('.campaign-landing-page__start-button');
}

export async function startCampaignByCodeAndExternalId(campaignCode, externalId = 'a73at01r3') {
  await visit(`/campagnes/${campaignCode}?participantExternalId=${externalId}`);
  await click('.campaign-landing-page__start-button');
}

export async function resumeCampaignOfTypeAssessmentByCode(campaignCode, hasExternalParticipantId) {
  await visit(`/campagnes/${campaignCode}`);
  await clickByLabel('Je commence');
  if (hasExternalParticipantId) {
    await fillIn('#id-pix-label', 'monmail@truc.fr');
    await clickByLabel('Continuer');
  }
  await clickByLabel('Ignorer');
}

export async function resumeCampaignOfTypeProfilesCollectionByCode(campaignCode, hasExternalParticipantId) {
  await visit(`/campagnes/${campaignCode}`);
  await clickByLabel("C'est parti !");
  if (hasExternalParticipantId) {
    await fillIn('#id-pix-label', 'monmail@truc.fr');
    await clickByLabel('Continuer');
  }
}

export async function completeCampaignOfTypeProfilesCollectionByCode(campaignCode) {
  await visit(`/campagnes/${campaignCode}`);
  await clickByLabel("J'envoie mon profil");
}
