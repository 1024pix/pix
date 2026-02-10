import type { Page } from '@playwright/test';

import { OrganizationDetailsPage } from './index.ts';

export class OrganizationsListPage {
  constructor(public readonly page: Page) {}

  async goToOrganizationDetails(organizationName: string) {
    await this.page
      .locator('table tbody tr', { has: this.page.getByText(organizationName) })
      .getByRole('link')
      .click();
    await this.page.waitForURL(/organizations\/\d+\/details/);

    return new OrganizationDetailsPage(this.page);
  }
}
