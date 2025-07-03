import { Page } from '@playwright/test';

export class CampaignResultsPage {
  constructor(private readonly page: Page) {}

  async getGlobalMasteryPercentage() {
    const strongText = await this.page.locator('div.evaluation-results-hero__results strong').textContent();
    return strongText.replace('%', '').trim();
  }

  async getMasteryPercentageForCompetence(competenceTitle: string) {
    const masteryPercentageText = await this.page.getByRole('row', { name: competenceTitle }).textContent();
    return masteryPercentageText.match(/(\d+)\s*%/)?.[1];
  }
}
