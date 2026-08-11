import type { Page } from '@playwright/test';

import { SessionManagementPage } from './SessionManagementPage.ts';
export class SessionFinalizationPage {
  constructor(public readonly page: Page) {}

  async finalizeSession() {
    await this.page.getByRole('button', { name: 'Finaliser' }).click();
    await this.page.getByRole('button', { name: 'Confirmer la finalisation' }).click();
    await this.page.waitForURL(/\/sessions\/\d+$/);
    await this.page
      .getByText('Les informations de la session ont été transmises avec succès.')
      .waitFor({ state: 'visible' });

    return new SessionManagementPage(this.page);
  }

  async markTechnicalIssueFor(lastName: string) {
    const row = this.page.locator('tbody tr', {
      has: this.page.getByText(lastName),
    });
    await row.locator('.pix-select-button').click();
    await row.getByRole('option', { name: 'Problème technique' }).click();
  }

  async markAbandonmentFor(lastName: string) {
    const row = this.page.locator('tbody tr', {
      has: this.page.getByText(lastName),
    });
    await row.locator('.pix-select-button').click();
    await row.getByRole('option', { name: 'Test non finalisé dans le délai imparti' }).click();
  }

  async close() {
    await this.page.close();
  }
}
