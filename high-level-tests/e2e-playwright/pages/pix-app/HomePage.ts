import type { Page } from '@playwright/test';

import { CertificateListPage, CertificationStartPage } from './index.ts';
export class HomePage {
  constructor(public readonly page: Page) {}

  async goToStartCertification() {
    await this.goToCertificationsPage();

    return new CertificationStartPage(this.page);
  }

  async goToMyCertificates() {
    await this.goToCertificationsPage();

    return new CertificateListPage(this.page);
  }

  private async goToCertificationsPage() {
    await this.page.getByRole('link', { name: 'Certifications', exact: true }).click();
    await this.page.waitForURL(/\/certifications$/);
  }

  async logout(baseUrl?: RegExp) {
    await this.page.getByRole('button', { name: /Consulter mes informations/i }).click();
    await this.page.getByRole('link', { name: 'Se déconnecter' }).click();

    const waitForUrl = new RegExp(baseUrl ?? /\/?lang=fr/);

    await this.page.waitForURL(waitForUrl);
  }
}
