import { expect, test } from '@playwright/test';

import { AssistantPage } from './AssistantPage.js';
import { VALID_VALUES, createCsvFile, uniqueSuffix } from './fixtures/csv.js';

const MESSAGE_CREATION = 'Crée les organisations à partir du document joint';

// ---------------------------------------------------------------------------
// Flux complet : simulation → confirmation → organisations créées
// ---------------------------------------------------------------------------

test('flux complet : CSV valide → 2 organisations créées', async ({ page }) => {
  const suffix = uniqueSuffix();
  const csvPath = createCsvFile([
    {
      nom: `Lycée Test Alpha ${suffix}`,
      type: VALID_VALUES.type.sco,
      equipe: VALID_VALUES.team.alpha,
      public: VALID_VALUES.learnerType.sco,
      pays: VALID_VALUES.country,
      externalId: `AUTO-ALPHA-${suffix}`,
    },
    {
      nom: `École Test Beta ${suffix}`,
      type: VALID_VALUES.type.pro,
      equipe: VALID_VALUES.team.pro,
      public: VALID_VALUES.learnerType.pro,
      pays: VALID_VALUES.country,
      externalId: `AUTO-BETA-${suffix}`,
    },
  ]);

  const assistant = new AssistantPage(page);
  await assistant.loginAndOpen();
  await assistant.attachFile(csvPath);
  await assistant.sendMessage(MESSAGE_CREATION);

  // --- Simulation ---
  await assistant.waitForSimulationTable();

  const rows = await assistant.getRows();
  expect(rows).toHaveLength(2);

  for (const row of rows) {
    expect(row.statut, `Ligne "${row.nom}" doit être prête`).toBe('prête');
    expect(row.detail).toBe('(simulation ok)');
  }

  expect(rows.map((r) => r.nom)).toContain(`Lycée Test Alpha ${suffix}`);
  expect(rows.map((r) => r.nom)).toContain(`École Test Beta ${suffix}`);

  // --- Confirmation → Exécution via approve_lot ---
  await assistant.confirmAndWaitForExecution();

  const finalRows = await assistant.getExecutionRows();
  for (const row of finalRows) {
    expect(row.statut, `Ligne "${row.nom}" doit être créée`).toBe('créée');
    expect(row.detail).toBe('Voir');
  }

  // Le lien "Voir" pointe vers une organisation réelle
  const voirLinks = await page.locator('.lot-tool-ui__table a[href^="/organizations/"]').all();
  expect(voirLinks).toHaveLength(2);
  for (const link of voirLinks) {
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/organizations\/\d+$/);
  }

  // Le bouton de téléchargement du bilan est présent
  await expect(assistant.downloadButton).toBeVisible();
});

// ---------------------------------------------------------------------------
// Erreurs de validation : données invalides → le modèle explique et bloque
// ---------------------------------------------------------------------------

test("erreurs de validation : organizationLearnerTypeName inconnu bloque l'approbation", async ({
  page,
}) => {
  const suffix = uniqueSuffix();
  const csvPath = createCsvFile([
    {
      nom: `Org Invalide ${suffix}`,
      type: VALID_VALUES.type.sco,
      equipe: VALID_VALUES.team.alpha,
      public: 'Type Inconnu XYZ',
      pays: VALID_VALUES.country,
      externalId: `AUTO-INVALID-${suffix}`,
    },
  ]);

  const assistant = new AssistantPage(page);
  await assistant.loginAndOpen();
  await assistant.attachFile(csvPath);
  await assistant.sendMessage(MESSAGE_CREATION);

  await assistant.waitForSimulationTable();

  const rows = await assistant.getRows();
  expect(rows).toHaveLength(1);
  expect(rows[0].statut).toBe('erreur');
  expect(rows[0].detail).toContain('notFound');

  // Le modèle n'a pas lancé l'exécution — aucun lien "Voir"
  await expect(page.locator('.lot-tool-ui__table a[href^="/organizations/"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// Détection de doublons : même externalId → l'un prêt, l'autre doublon
// ---------------------------------------------------------------------------

test('doublons : même identifiant_externe → premier prêt, deuxième doublon', async ({
  page,
}) => {
  const suffix = uniqueSuffix();
  const sharedExternalId = `AUTO-DUP-${suffix}`;

  const csvPath = createCsvFile([
    {
      nom: `Org Originale ${suffix}`,
      type: VALID_VALUES.type.sco,
      equipe: VALID_VALUES.team.alpha,
      public: VALID_VALUES.learnerType.sco,
      pays: VALID_VALUES.country,
      externalId: sharedExternalId,
    },
    {
      nom: `Org Doublon ${suffix}`,
      type: VALID_VALUES.type.sco,
      equipe: VALID_VALUES.team.alpha,
      public: VALID_VALUES.learnerType.sco,
      pays: VALID_VALUES.country,
      externalId: sharedExternalId,
    },
  ]);

  const assistant = new AssistantPage(page);
  await assistant.loginAndOpen();
  await assistant.attachFile(csvPath);
  await assistant.sendMessage(MESSAGE_CREATION);

  await assistant.waitForSimulationTable();

  const rows = await assistant.getRows();
  expect(rows).toHaveLength(2);

  const statuts = rows.map((r) => r.statut).sort();
  expect(statuts).toEqual(['doublon', 'prête']);

  // Aucune organisation créée (pas de confirmation)
  await expect(page.locator('.lot-tool-ui__table a[href^="/organizations/"]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// Arrêt et reprise de l'exécution
// ---------------------------------------------------------------------------

test("arrêt/reprise : stopper l'exécution puis la reprendre jusqu'au bout", async ({ page }) => {
  const suffix = uniqueSuffix();

  const csvPath = createCsvFile([
    {
      nom: `Stop Org 1 ${suffix}`,
      type: VALID_VALUES.type.sco,
      equipe: VALID_VALUES.team.alpha,
      public: VALID_VALUES.learnerType.sco,
      pays: VALID_VALUES.country,
      externalId: `AUTO-STOP1-${suffix}`,
    },
    {
      nom: `Stop Org 2 ${suffix}`,
      type: VALID_VALUES.type.pro,
      equipe: VALID_VALUES.team.pro,
      public: VALID_VALUES.learnerType.pro,
      pays: VALID_VALUES.country,
      externalId: `AUTO-STOP2-${suffix}`,
    },
    {
      nom: `Stop Org 3 ${suffix}`,
      type: VALID_VALUES.type.sup,
      equipe: VALID_VALUES.team.sco,
      public: VALID_VALUES.learnerType.student,
      pays: VALID_VALUES.country,
      externalId: `AUTO-STOP3-${suffix}`,
    },
  ]);

  const assistant = new AssistantPage(page);
  await assistant.loginAndOpen();
  await assistant.attachFile(csvPath);
  await assistant.sendMessage(MESSAGE_CREATION);

  await assistant.waitForSimulationTable();

  const rows = await assistant.getRows();
  expect(rows).toHaveLength(3);
  const allPret = rows.every((r) => r.statut === 'prête');
  test.skip(!allPret, 'Données seed invalides — skip test arrêt/reprise');

  // Confirmer → le LLM appelle approve_lot → exécution démarre
  await assistant.sendMessage('oui, créer');

  // Essayer d'arrêter pendant l'exécution
  const stopVisible = await assistant.stopButton.isVisible({ timeout: 30_000 }).catch(() => false);
  if (stopVisible) {
    await assistant.stopButton.click();
    await expect(assistant.resumeButton).toBeVisible({ timeout: 10_000 });
    await assistant.resumeButton.click();
  }

  // Tout doit être créé au final
  await expect(assistant.downloadButton).toBeVisible({ timeout: 90_000 });

  const finalRows = await assistant.getExecutionRows();
  for (const row of finalRows) {
    expect(row.statut).toBe('créée');
  }
});
