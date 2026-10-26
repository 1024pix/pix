import type { Page } from '@playwright/test';

import { HomePage } from './HomePage.ts';
export class LoginPage {
  constructor(public readonly page: Page) {}

  async login(emailOrUsername: string, rawPassword: string, shouldAcceptCgu: boolean = false) {
    await this.page.getByLabel('Adresse e-mail ou identifiant').fill(emailOrUsername);
    await this.page.getByLabel('Mot de passe').fill(rawPassword);
    await this.page.getByRole('button', { name: 'Je me connecte' }).click();
    if (shouldAcceptCgu) {
      await this.page.waitForURL(/\/cgu$/);
      await this.page.getByRole('button', { name: 'Accepter et continuer' }).click();
    }

    await this.page.waitForURL(/\/accueil$/);
    return new HomePage(this.page);
  }

  async signup(firstName: string, lastName: string, email: string, rawPassword: string) {
    await this.page.getByRole('link', { name: "S'inscrire" }).click();
    await this.page.getByRole('textbox', { name: 'Prénom' }).fill(firstName);
    await this.page.getByRole('textbox', { name: 'Nom', exact: true }).fill(lastName);
    await this.page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Mot de passe' }).fill(rawPassword);
    await this.page.getByRole('checkbox', { name: "J'accepte les conditions" }).check();
    await this.page.getByRole('button', { name: "Je m'inscris" }).click();
    await this.page.waitForURL(/\/accueil$/);

    return new HomePage(this.page);
  }
}
