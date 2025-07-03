import { Page } from '@playwright/test';

export class CompetenceResultPage {
  constructor(private readonly page: Page) {}

  async getLevel() {
    const levelLocator = this.page.locator('.competence-card__level .score-value');
    return (await levelLocator.textContent())?.trim();
  }

  async getPixScore() {
    const pixScoreLocator = this.page.locator('.pix-earned .score-value');
    return (await pixScoreLocator.textContent())?.trim();
  }

  async goBackToCompetences() {
    await this.page.getByRole('link', { name: 'Revenir aux compétences' }).click();
  }
}
