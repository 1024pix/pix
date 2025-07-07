import { Page } from '@playwright/test';

export class CreateCampaignPage {
  constructor(private readonly page: Page) {}

  async createEvaluationCampaign({
    campaignName,
    targetProfileName,
  }: {
    campaignName: string;
    targetProfileName: string;
  }) {
    await this.page.getByLabel('Nom de la campagne *').fill(campaignName);
    await this.page.getByRole('radio', { name: 'Évaluer les participants' }).check();
    await this.page.getByRole('button', { name: 'Que souhaitez-vous tester ? *' }).click();
    await this.page.getByRole('option', { name: targetProfileName }).click();
    await this.page.getByRole('button', { name: 'Créer la campagne' }).click();
  }
}
