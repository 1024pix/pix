import { Page } from '@playwright/test';

export class CampaignResultsPage {
  constructor(private readonly page: Page) {}

  async getGlobalMasteryPercentage() {
    const strongText = (await this.page.locator('div.evaluation-results-hero__results strong').textContent()) as string;
    return strongText.replace('%', '').trim();
  }

  async getMasteryPercentageForCompetence(competenceTitle: string) {
    const masteryPercentageText = (await this.page.getByRole('row', { name: competenceTitle }).textContent()) as string;
    return masteryPercentageText.match(/(\d+)\s*%/)?.[1];
  }

  async sendResults() {
    await this.page.getByRole('button', { name: "J'envoie mes résultats" }).click();
  }
}
