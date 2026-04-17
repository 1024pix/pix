import type { Page } from '@playwright/test';

import { CERTIFICATIONS_DATA } from '../../helpers/db-data.ts';
import { SessionFinalizationPage } from './SessionFinalizationPage.ts';

export type CertificationKeys = (typeof CERTIFICATIONS_DATA)[keyof typeof CERTIFICATIONS_DATA] | 'CORE';

export class SessionManagementPage {
  constructor(public readonly page: Page) {}

  async getSessionData() {
    await this.page.getByRole('link', { name: 'Détails' }).click();
    await this.page.waitForURL(/\/sessions\/\d+$/);
    const sessionNumber = (
      await this.page
        .locator('h3:has-text("Numéro de session")')
        .locator('xpath=..')
        .locator('.session-details-content__text')
        .innerText()
    ).trim();

    const accessCode = (
      await this.page
        .locator('h3:has-text("Code d\'accès")')
        .locator('xpath=..')
        .locator('.session-details-content__text')
        .innerText()
    ).trim();

    const invigilatorCodeWithPrefix = (
      await this.page
        .locator('h3:has-text("Mot de passe de session")')
        .locator('xpath=..')
        .locator('.session-details-content__text')
        .innerText()
    ).trim();
    const invigilatorCode = invigilatorCodeWithPrefix.replace(/^C-/, '');
    return {
      sessionNumber,
      accessCode,
      invigilatorCode,
    };
  }

  async goToEnrollCandidateForm() {
    await this.page.getByRole('link', { name: /^Candidats/ }).click();
    await this.page.waitForURL(/\/sessions\/\d+\/candidats$/);
    await this.page.getByRole('button', { name: 'Inscrire un candidat' }).click();
  }

  async goToEnrollScoCandidateForm() {
    await this.page.getByRole('link', { name: /^Candidats/ }).click();
    await this.page.waitForURL(/\/sessions\/\d+\/candidats$/);
    await this.page.getByRole('link', { name: 'Inscrire des candidats' }).click();
  }

  async goToFinalizeSession() {
    await this.page.getByRole('link', { name: 'Détails' }).click();
    await this.page.waitForURL(/\/sessions\/\d+$/);
    await this.page.reload();
    await this.page.getByRole('link', { name: 'Finaliser la session' }).click();
    await this.page.waitForURL(/\/sessions\/\d+\/finalisation$/);

    return new SessionFinalizationPage(this.page);
  }

  async addCandidate({
    sex,
    firstName,
    lastName,
    birthdate,
    birthCountry,
    birthCity,
    postalCode,
    enrollFor = 'CORE',
    checkForSuccess = true,
  }: {
    sex: string;
    firstName: string;
    lastName: string;
    birthdate: string;
    birthCountry: string;
    birthCity: string;
    postalCode: string;
    enrollFor?: CertificationKeys;
    checkForSuccess?: boolean;
  }) {
    if (sex === 'F') {
      await this.page.getByRole('radio', { name: 'Femme' }).check();
    } else {
      await this.page.getByRole('radio', { name: 'Homme' }).check();
    }
    await this.page.getByLabel('Nom de naissance').fill(lastName);
    await this.page.getByLabel('Prénom').fill(firstName);
    await this.page.getByLabel('Date de naissance').fill(birthdate);
    await this.page.getByRole('button', { name: 'Pays de naissance *' }).click();
    await this.page.getByRole('option', { name: birthCountry }).click();
    await this.page.getByRole('radio', { name: 'Code postal' }).check();
    await this.page.getByLabel('Code postal de naissance').fill(postalCode);
    await this.page.getByLabel('Commune de naissance').fill(birthCity);
    await this.page.getByRole('button', { name: 'Tarification part Pix *' }).click();
    await this.page.getByRole('option', { name: 'Gratuite' }).click();
    let choice;
    switch (enrollFor) {
      case CERTIFICATIONS_DATA.CLEA:
        choice = 'Double Certification Pix-CléA Numérique';
        break;
      case CERTIFICATIONS_DATA.EDU_1ER_DEGRE:
        choice = 'Pix+ Édu 1er degré';
        break;
      case CERTIFICATIONS_DATA.DROIT:
        choice = 'Pix+ Droit';
        break;
      case CERTIFICATIONS_DATA.PRO_SANTE:
        choice = 'Pix+ Professionnels de santé';
        break;
      default:
        choice = 'Certification Pix';
        break;
    }
    const radio = this.page.getByRole('radio', { name: choice, exact: true });

    if (await radio.isVisible()) {
      await radio.check();
    }
    await this.page.getByRole('button', { name: 'Inscrire le candidat' }).click();
    if (checkForSuccess) {
      await this.page.getByText('Le candidat a été inscrit avec succès.').waitFor({ state: 'visible' });
      await this.page.getByRole('button', { name: 'Fermer la notification' }).click();
    }
  }

  async addScoCandidate({ firstName, lastName }: { firstName: string; lastName: string }) {
    await this.page.getByLabel(`Sélectionner le candidat ${firstName} ${lastName}`).click();
    await this.page.getByRole('button', { name: 'Inscrire' }).click();
  }

  async getEnrolledCandidatesData() {
    await this.page.getByRole('link', { name: /^Candidats/ }).click();
    await this.page.waitForURL(/\/sessions\/\d+\/candidats$/);
    const table = this.page.locator('table');
    const headers = await table.locator('thead th').allTextContents();
    const rows = await table.locator('tbody tr').all();

    const results = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      const rowObject: Record<string, string> = {};

      for (let i = 0; i < headers.length; i++) {
        const columnName = headers[i].trim();
        rowObject[columnName] = cells[i]?.trim() || '';
      }
      results.push(rowObject);
    }

    return results;
  }

  async importOdsFile(filePath: string) {
    await this.page.getByRole('link', { name: /^Candidats/ }).click();
    await this.page.waitForURL(/\/sessions\/\d+\/candidats$/);
    await this.page.getByLabel('Importer (.ods)').setInputFiles(filePath);
  }
}
