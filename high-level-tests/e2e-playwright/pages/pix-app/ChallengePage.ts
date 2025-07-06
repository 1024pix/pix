import { Page } from '@playwright/test';

export class ChallengePage {
  constructor(private readonly page: Page) {}

  async getChallengeImprint() {
    const instruction = await this.page.locator('p', { hasText: 'ninaimprint' }).textContent();
    if (!instruction) throw new Error('No ninaimprint found in instruction for challenge');
    const match = instruction.match(/ninaimprint (\d+)/);
    const challengeNumber = match?.[1];
    if (!challengeNumber) throw new Error('No ninaimprint found in instruction for challenge');
    return challengeNumber;
  }

  async setRightOrWrongAnswer(shouldAnswerCorrectly: boolean) {
    await this.page.getByRole('radio', { name: shouldAnswerCorrectly ? 'Oui.' : 'Non.' }).check();
  }

  async validateAnswer() {
    const challengeNumber = await this.getChallengeImprint();
    const validateAnswerButton = this.page.getByRole('button', {
      name: 'Je valide et je vais à la prochaine question',
    });
    const selector = `p:has-text("ninaimprint ${challengeNumber}")`;
    await Promise.all([validateAnswerButton.click(), this.page.waitForSelector(selector, { state: 'detached' })]);
    const hasLoader = await this.page.locator('.app-loader').isVisible();
    if (hasLoader) {
      await this.page.waitForSelector('.app-loader', { state: 'detached' });
    }
  }

  async hasUserLeveledUp() {
    const notification = this.page.getByText('Niveau 1 gagné !');
    try {
      await notification.waitFor({ timeout: 200 });
      return true;
    } catch {
      return false;
    }
  }

  async leave() {
    await this.page.getByRole('button', { name: 'Quitter' }).click();
    await this.page.getByRole('link', { name: "Quitter l'épreuve et retourner à la page d'accueil" }).click();
  }
}
