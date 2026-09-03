import { expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'superadmin@example.net';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'pix123';

/**
 * Page Object pour l'assistant LLM de pix-admin.
 * Encapsule login, ouverture du panneau, upload CSV et interactions avec le lot.
 */
export class AssistantPage {
  constructor(page) {
    this.page = page;

    // Composer
    this.fileInput = page.locator('input[type="file"]');
    this.messageInput = page.locator('.composer__input');
    this.sendButton = page.locator('.composer__send');

    // Lot — simulation
    this.simulationTable = page.locator('.lot-tool-ui__table').first();
    this.tableRows = page.locator('.lot-tool-ui__table').first().locator('tbody tr');
    this.simError = page.locator('.lot-tool-ui__error');

    // Lot — exécution (approve_lot tool)
    this.executionTable = page.locator('.lot-tool-ui__table').last();
    this.executionRows = page.locator('.lot-tool-ui__table').last().locator('tbody tr');
    this.stopButton = page.locator('.btn--secondary').filter({ hasText: /Arrêter/ });
    this.resumeButton = page.locator('.btn--secondary').filter({ hasText: /Reprendre/ });
    this.downloadButton = page.locator('.btn--secondary').filter({ hasText: /Télécharger/ });

    // Pièce jointe en attente
    this.attachment = page.locator('.composer__attachment');
  }

  /** Se connecte en tant que superadmin et ouvre le panneau assistant. */
  async loginAndOpen() {
    await this.page.goto('/login');
    await this.page.locator('.pix-input__input').nth(0).fill(ADMIN_EMAIL);
    await this.page.locator('.pix-input__input').nth(1).fill(ADMIN_PASSWORD);
    await this.page.locator('button[type="submit"]').first().click();
    await this.page.waitForURL((url) => !url.toString().includes('/login'));

    await this.page.locator('button[aria-label*="assistant"]').first().click();
    await expect(this.page.locator('.assistant-popover')).toBeVisible();
  }

  /** Joint un fichier CSV au message. */
  async attachFile(csvPath) {
    await this.fileInput.setInputFiles(csvPath);
    await expect(this.attachment).toBeVisible();
  }

  /** Envoie un message dans le composer. Attend que le thread soit prêt avant d'envoyer. */
  async sendMessage(text) {
    await this.messageInput.fill(text);
    // The send button is disabled while the LLM is streaming — wait for it to be ready
    await expect(this.sendButton).toBeEnabled({ timeout: 30_000 });
    await this.sendButton.click();
  }

  /**
   * Attend que le tableau de simulation apparaisse et que toutes les lignes aient un statut final.
   */
  async waitForSimulationTable() {
    await expect(this.simulationTable).toBeVisible({ timeout: 90_000 });
    await expect(this.simError).not.toBeVisible();
    await expect(this.page.locator('.badge--loading')).toHaveCount(0, { timeout: 90_000 });
  }

  /**
   * Confirme la création et attend que l'exécution se termine (bouton Télécharger visible).
   * Le LLM reçoit le résultat de simulation, l'utilisateur envoie le message de confirmation,
   * puis le LLM appelle approve_lot.
   */
  async confirmAndWaitForExecution(confirmMessage = 'oui, créer') {
    await this.sendMessage(confirmMessage);
    await expect(this.downloadButton).toBeVisible({ timeout: 90_000 });
  }

  /** Retourne les données des lignes du premier tableau (simulation). */
  async getRows() {
    const rows = await this.tableRows.all();
    return Promise.all(
      rows.map(async (row) => {
        const cells = await row.locator('td').allInnerTexts();
        return {
          ligne: cells[0]?.trim(),
          nom: cells[1]?.trim(),
          statut: cells[2]?.trim(),
          detail: cells[3]?.trim(),
        };
      }),
    );
  }

  /** Retourne les données des lignes du tableau d'exécution (approve_lot). */
  async getExecutionRows() {
    const rows = await this.executionRows.all();
    return Promise.all(
      rows.map(async (row) => {
        const cells = await row.locator('td').allInnerTexts();
        return {
          ligne: cells[0]?.trim(),
          nom: cells[1]?.trim(),
          statut: cells[2]?.trim(),
          detail: cells[3]?.trim(),
        };
      }),
    );
  }
}
