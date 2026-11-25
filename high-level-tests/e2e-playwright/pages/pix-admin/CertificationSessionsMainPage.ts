import type { Page } from '@playwright/test';

import { waitForHiddenWithReload, waitForVisibleWithReload } from '../../helpers/utils.ts';
import { CertificationInformationPage, CertificationSessionPage } from './index.ts';

export class CertificationSessionsMainPage {
  constructor(public readonly page: Page) {}

  async goToSessionWithRequiredActionPage(sessionNumber: string) {
    await this.page.getByRole('link', { name: /V3 — Sessions à traiter/ }).click();
    await this.page.waitForURL(/\/sessions\/list\/with-required-action\?version=3$/);

    const locatorToWaitFor = this.page.getByRole('link', {
      name: sessionNumber,
      exact: true,
    });
    await waitForVisibleWithReload(this.page, locatorToWaitFor);

    await locatorToWaitFor.click();
    await this.page.waitForURL(/\/sessions\/\d+$/);

    return new CertificationSessionPage(this.page);
  }
  async goToSessionToPublishInfo(sessionNumber: string) {
    await this.page.getByRole('link', { name: /V3 — Sessions à publier/ }).click();
    await this.page.waitForURL(/\/sessions\/list\/to-be-published\?version=3$/);

    const locatorToWaitFor = this.page.getByRole('link', {
      name: sessionNumber,
      exact: true,
    });
    await waitForVisibleWithReload(this.page, locatorToWaitFor);

    await locatorToWaitFor.click();
    await this.page.waitForURL(/\/sessions\/\d+$/);

    return new CertificationSessionPage(this.page);
  }

  async publishSession(sessionNumber: string) {
    await this.page.getByRole('link', { name: /V3 — Sessions à publier/ }).click();
    await this.page.waitForURL(/\/sessions\/list\/to-be-published\?version=3$/);
    await this.page.getByRole('button', { name: `Publier la session numéro ${sessionNumber}` }).click();
    const publicationResponse = this.page.waitForResponse(
      (response) => response.request().method() === 'PATCH' && /\/sessions\/\d+\/publish$/.test(response.url()),
    );
    await this.page.getByRole('button', { name: 'Confirmer' }).click();
    await publicationResponse;
    const row = this.page.locator('table tbody tr').filter({
      has: this.page.getByText(sessionNumber, { exact: true }),
    });
    await waitForHiddenWithReload(this.page, row, { timeout: 15_000 });
  }

  async goToCertificationWithSearchBar(certificationNumber: string) {
    await this.page.getByLabel('Rechercher une certification avec un identifiant').fill(certificationNumber);
    await this.page.getByRole('button', { name: 'Charger' }).click();
    await this.page.waitForURL(/\/sessions\/certification\/\d+$/);
    return new CertificationInformationPage(this.page);
  }
}
