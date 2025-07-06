import { Page } from '@playwright/test';

export class SessionManagementPage {
  constructor(private readonly page: Page) {}

  async getSessionData() {
    await this.page.getByRole('link', { name: 'Détails' }).click();
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

  async addCandidate({ sex, firstName, lastName, birthdate, birthCountry, birthCity, postalCode }) {
    await this.page.getByRole('link', { name: 'Candidats' }).click();
    await this.page.getByRole('button', { name: 'Inscrire un candidat' }).click();
    if (sex === 'F') {
      await this.page.getByRole('radio', { name: 'Femme' }).check();
    } else {
      await this.page.getByRole('radio', { name: 'Homme' }).check();
    }
    await this.page.getByLabel('Nom de naissance').fill(lastName);
    await this.page.getByLabel('Prénom').fill(firstName);
    await this.page.getByLabel('Date de naissance').pressSequentially(birthdate.replaceAll('/', ''));
    await this.page.getByRole('button', { name: 'Pays de naissance *' }).click();
    await this.page.getByRole('option', { name: birthCountry }).click();
    await this.page.getByRole('radio', { name: 'Code postal' }).check();
    await this.page.getByLabel('Code postal de naissance').fill(postalCode);
    await this.page.getByLabel('Commune de naissance').fill(birthCity);
    await this.page.getByRole('button', { name: 'Tarification part Pix *' }).click();
    await this.page.getByRole('option', { name: 'Gratuite' }).click();
    await this.page.getByRole('button', { name: 'Inscrire le candidat' }).click();
  }
}
