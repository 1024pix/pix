import { Page } from '@playwright/test';

export class SessionCreationPage {
  constructor(private readonly page: Page) {}

  async createSession({
    address,
    room,
    examiner,
    hour,
    minute,
  }: {
    address: string;
    room: string;
    examiner: string;
    hour: string;
    minute: string;
  }) {
    await this.page.getByLabel('Nom du site').fill(address);
    await this.page.getByLabel('Nom de la salle').fill(room);
    await this.page.locator('form div').filter({ hasText: 'Date de début *' }).getByRole('textbox').click();
    const currentYear = new Date().getFullYear();
    const dateToPick = this.page.locator(`span[aria-label$="${currentYear}"]:not(.flatpickr-disabled)`).first();
    await dateToPick.click();
    await this.page.getByLabel('Heure de début').click();
    await this.page.getByRole('spinbutton', { name: 'Hour' }).fill(hour);
    await this.page.getByRole('spinbutton', { name: 'Minute' }).fill(minute);
    // Force losing focus on Datetime input, because it overlays Surveillant label and seems to make it
    // unfillable by playwright :sad:
    await this.page.getByLabel('Nom du site').click();
    await this.page.getByLabel('Surveillant(s)').fill(examiner);
    await this.page.getByRole('button', { name: 'Créer la session' }).click();
  }
}
