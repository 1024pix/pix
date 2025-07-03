import { Page } from '@playwright/test';

export class IntermediateCheckpointPage {
  constructor(private readonly page: Page) {}

  async goNext() {
    const currentUrl = this.page.url();
    await Promise.all([
      this.page.waitForURL((url) => url.toString() !== currentUrl),
      this.page.getByRole('link', { name: 'Continuer' }).first().click(),
    ]);
    const hasLoader = await this.page.locator('.app-loader').isVisible();
    if (hasLoader) {
      await this.page.waitForSelector('.app-loader', { state: 'detached' });
    }
  }
}
