import { expect, Page } from '@playwright/test';

import { CertificationStartPage } from '../../pages/pix-app/index.ts';
import { SessionCreationPage, SessionManagementPage } from '../../pages/pix-certif/index.ts';

export async function createSessionAndExpectSuccess(
  page: Page,
  data: {
    address: string;
    room: string;
    examiner: string;
    hour: string;
    minute: string;
  },
) {
  const sessionPage = new SessionCreationPage(page);
  await sessionPage.createSession(data);
  await expect(page.getByRole('heading', { name: "Code d'accès" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mot de passe de session' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Numéro de session' })).toBeVisible();
}

export async function enrollCandidateAndExpectSuccess(
  page: Page,
  data: {
    sex: string;
    firstName: string;
    lastName: string;
    birthdate: string;
    birthCountry: string;
    birthCity: string;
    postalCode: string;
  },
) {
  const sessionPage = new SessionManagementPage(page);
  await sessionPage.addCandidate(data);
  await expect(page.getByText('Le candidat a été inscrit avec succès.')).toBeVisible();
}

export async function enterSessionUntilAccessCodeAndExpectSuccess(
  page: Page,
  data: {
    sessionNumber: string;
    firstName: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
  },
) {
  const certificationStartPage = new CertificationStartPage(page);
  await certificationStartPage.fillSessionInfoAndNavigateIntro(data);
  await expect(page.getByText('Vous allez commencer votre test de certification')).toBeVisible();
}

export async function authorizeCandidateToStartAndExpectSuccess(
  page: Page,
  data: {
    sessionNumber: string;
    invigilatorCode: string;
    firstName: string;
    lastName: string;
  },
) {
  await page.getByLabel('Numéro de la session').fill(data.sessionNumber);
  await page.getByLabel('Mot de passe de la session').fill(data.invigilatorCode);
  await page.getByRole('button', { name: 'Surveiller la session' }).click();
  await page
    .getByRole('button', {
      name: `Confirmer la présence de l'élève ${data.firstName} ${data.lastName}`,
    })
    .click();
  await expect(page.getByText('1/1 candidat présent')).toBeVisible();
}
