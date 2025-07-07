import { Page } from '@playwright/test';

export class StartCampaignPage {
  constructor(private readonly page: Page) {}

  async goToFirstChallenge(campaignCode: string) {
    await this.page.getByLabel('Saisir votre code pour').fill(campaignCode);
    await this.page.getByRole('button', { name: 'Accéder au parcours' }).click();
    await this.page.getByRole('button', { name: 'Je commence' }).click();
    await this.page.getByRole('button', { name: 'Ignorer' }).click();
  }
}
