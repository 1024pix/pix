import { Page } from '@playwright/test';

export class CertificationStartPage {
  constructor(private readonly page: Page) {}

  async fillSessionInfoAndNavigateIntro({
    sessionNumber,
    firstName,
    lastName,
    birthDay,
    birthMonth,
    birthYear,
  }: {
    sessionNumber: string;
    firstName: string;
    lastName: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
  }) {
    await this.page.getByLabel('Numéro de session').fill(sessionNumber);
    await this.page.getByLabel('Prénom').fill(firstName);
    await this.page.getByLabel('Nom de naissance').fill(lastName);
    await this.page.getByRole('spinbutton', { name: 'Date de naissance jour de' }).fill(birthDay);
    await this.page.getByRole('spinbutton', { name: 'mois de naissance (MM)' }).fill(birthMonth);
    await this.page.getByRole('spinbutton', { name: 'année de naissance (AAAA)' }).fill(birthYear);
    await this.page.getByRole('button', { name: 'Continuer' }).click();
    await this.page.getByRole('button', { name: "Continuer vers l'écran suivant" }).click();
    await this.page.getByRole('button', { name: "Continuer vers l'écran suivant" }).click();
    await this.page.getByRole('button', { name: "Continuer vers l'écran suivant" }).click();
    await this.page.getByRole('button', { name: "Continuer vers l'écran suivant" }).click();
    await this.page.getByRole('checkbox', { name: 'En cochant cette case' }).check();
    await this.page.getByRole('button', { name: "Continuer vers la page d'entrée" }).click();
  }
}
