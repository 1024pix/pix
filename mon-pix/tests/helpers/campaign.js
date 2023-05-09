import { click, fillIn } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';

export async function startCampaignwithTypeAssessmentByCode(campaignCode) {
  const screen = await visit(`/campagnes/${campaignCode}`);
  await click(screen.getByRole('button', { name: 'Je commence' }));
  return screen;
}

export async function startCampaignwithTypeProfilesByCode(campaignCode) {
  const screen = await visit(`/campagnes/${campaignCode}`);
  await click(screen.getByRole('button', { name: "C'est parti !" }));
  return screen;
}

export async function startCampaignwithTypeAssessmentByCodeAndExternalId(campaignCode, externalId = 'a73at01r3') {
  const screen = await visit(`/campagnes/${campaignCode}?participantExternalId=${externalId}`);
  await click(screen.getByRole('button', { name: 'Je commence' }));
  return screen;
}

export async function startCampaignwithTypeProfilesByCodeAndExternalId(campaignCode, externalId = 'a73at01r3') {
  const screen = await visit(`/campagnes/${campaignCode}?participantExternalId=${externalId}`);
  await click(screen.getByRole('button', { name: "C'est parti !" }));
  return screen;
}

export async function resumeCampaignOfTypeAssessmentByCode(campaignCode, hasExternalParticipantId) {
  const screen = await visit(`/campagnes/${campaignCode}`);
  await click(screen.getByRole('button', { name: 'Je commence' }));
  if (hasExternalParticipantId) {
    await fillIn(screen.getByRole('textbox', { name: 'email' }), 'monmail@truc.fr');
    await click(screen.getByRole('button', { name: 'Continuer' }));
  }
  await click(screen.getByRole('button', { name: 'Ignorer' }));
}

export async function resumeCampaignOfTypeProfilesCollectionByCode(campaignCode, hasExternalParticipantId) {
  const screen = await visit(`/campagnes/${campaignCode}`);
  await click(screen.getByRole('button', { name: "C'est parti !" }));
  if (hasExternalParticipantId) {
    await fillIn(screen.getByRole('textbox', { name: 'email' }), 'monmail@truc.fr');
    await click(screen.getByRole('button', { name: 'Continuer' }));
  }
}

export async function completeCampaignOfTypeProfilesCollectionByCode(campaignCode) {
  const screen = await visit(`/campagnes/${campaignCode}`);
  const sendProfileButtons = screen.getAllByRole('button', { name: "J'envoie mon profil" });
  await click(sendProfileButtons[0]);
}
