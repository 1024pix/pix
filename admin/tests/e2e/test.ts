import { test as base, Page } from '@playwright/test';

type Fixtures = {
  menuNavigation: MenuNavigation,
};

class MenuNavigation {
  page: Page

  constructor({ page }: { page: Page }) {
    this.page = page
  }

  async click(name: string) {
    return this.page
      .getByRole('navigation', { name: 'Navigation principale' })
      .getByRole('listitem')
      .filter({ has: this.page.getByRole('tooltip', { name, includeHidden: true }) })
      .click();
  }
}

export const test = base.extend<Fixtures>({
  async menuNavigation({ page }, use) {
    await use(new MenuNavigation({ page }));
  },
});

export { expect } from '@playwright/test';
