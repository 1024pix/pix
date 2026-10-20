import { Page } from '@playwright/test';
export class ChallengePage {
  constructor(public readonly page: Page) {}

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

  async skip() {
    await this.#next('Je passe et je vais à la prochaine question');
  }

  async validateAnswer() {
    await this.#next('Je valide et je vais à la prochaine question');
  }

  async #next(buttonName: string) {
    const previousUrl = this.page.url();
    const oldChallengeNumber = await this.getChallengeImprint();
    const validateAnswerButton = this.page.getByRole('button', {
      name: buttonName,
    });
    await validateAnswerButton.click();

    await this.page.waitForURL((url) => url.toString() !== previousUrl);

    const oldImprint = this.page.locator(`p:has-text("ninaimprint ${oldChallengeNumber}")`);
    await oldImprint.waitFor({ state: 'detached' });

    const loader = this.page.locator('.app-loader');
    await loader.waitFor({ state: 'hidden' });

    await this.page.waitForLoadState('load');
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

  async getCertificationNumber() {
    return await this.page.getByTestId(`pw-certification-number`).innerText();
  }
}
