import type { Page } from '@playwright/test';
export class PixOrgaPage {
  constructor(public readonly page: Page) {}

  async login(email: string, rawPassword: string) {
    await this.page.getByLabel('Adresse e-mail').fill(email);
    await this.page.getByLabel('Mot de passe').fill(rawPassword);

    await this.page.getByRole('button', { name: 'Je me connecte' }).click();
  }

  async acceptCGU() {
    await this.page.getByRole('button', { name: 'Accepter et continuer' }).click();
  }

  async waitForTheImportToComplete(page: Page) {
    let done;
    await page.getByRole('heading', { name: 'Importer des' }).waitFor();
    do {
      await page.waitForTimeout(1000);
      await page.reload({ waitUntil: 'load' });
      await page.getByRole('heading', { name: 'Importer des' }).waitFor();
      done = await page.getByRole('paragraph').filter({ hasText: 'Dernier fichier importé avec succès' }).isVisible();
    } while (!done);
  }

  async waitForParticipationScoreComputed(score: string, page: Page) {
    let masteryPercentageVisible = await page
      .getByRole('definition')
      .filter({ hasText: `${score} %` })
      .isVisible();
    while (!masteryPercentageVisible) {
      await page.reload({ waitUntil: 'load' });
      await page.getByRole('definition').filter({ hasText: `%` }).waitFor();
      masteryPercentageVisible = await page
        .getByRole('definition')
        .filter({ hasText: `${score} %` })
        .isVisible();
    }
  }

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
