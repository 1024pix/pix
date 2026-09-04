import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { expect, test } from '../../fixtures/index.ts';
import { getGarTokenForExistingUser } from '../../helpers/auth.ts';
import {
  buildExistingOrganizationLearner,
  buildFreshPixOrgaUser,
  createGARUser,
  createOrganizationInDB,
  knex,
} from '../../helpers/db.ts';
import { ChallengePage, HomePage, ReconciliationLoginPage, ReconciliationPage } from '../../pages/pix-app/index.ts';
import { PixOrgaPage } from '../../pages/pix-orga/PixOrgaPage.ts';

let UAJ: string;
let GARUserId: number;

test.beforeEach(async () => {
  UAJ = randomUUID().slice(-8);
  GARUserId = await createGARUser(UAJ, 'stéphanie', 'chaire', true);
  const { organizationId } = await buildFreshPixOrgaUser('Adi', 'Minh', `admin-${UAJ}@example.net`, 'pix123', 'ADMIN', {
    type: 'SCO',
    externalId: `SCO_MANAGING-${UAJ}`,
    isManagingStudents: true,
  });

  const anotherSCOOrganizationId = await createOrganizationInDB({
    type: 'SCO',
    externalId: `OTHER_SCO_MANAGING-${UAJ}`,
    isManagingStudents: true,
  });

  await buildExistingOrganizationLearner({
    firstName: 'Alain',
    lastName: 'Deloin',
    email: `alain-${UAJ}@deloin.io`,
    birthdate: '1994-12-01',
    nationalStudentId: `${UAJ}-5`,
    rawPassword: 'alain-deloin-password',
    isDisabled: true,
    organizationId: anotherSCOOrganizationId,
  });

  await buildExistingOrganizationLearner({
    firstName: 'Katie',
    lastName: 'veuns',
    email: `katie-${UAJ}@veuns.io`,
    nationalStudentId: `${UAJ}-4`,
    rawPassword: 'katieveuns-password',
    isDisabled: true,
    organizationId,
  });

  let file = (await readFile(path.join(import.meta.dirname, '..', '..', 'data', 'sco-ok.xml'))).toString();
  let count = 1;
  file = file
    .replace(/<UAJ>.*<\/UAJ>/, `<UAJ>SCO_MANAGING-${UAJ}</UAJ>`)
    .replace(/<ID_NATIONAL>.*<\/ID_NATIONAL>/g, () => `/<ID_NATIONAL>${UAJ}-${count++}</ID_NATIONAL>`);

  await writeFile(path.join(os.tmpdir(), `sco-${UAJ}.xml`), file);
});

test('Managing sco learners', async ({ page }) => {
  test.slow();
  let campaignCode: string;
  const orgaPage = new PixOrgaPage(page);
  const challengePage = new ChallengePage(page);
  const homePage = new HomePage(page);
  const reconciliationLoginPage = new ReconciliationLoginPage(page);
  const reconciliationPage = new ReconciliationPage(page);

  await test.step('Login to pixOrga', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await orgaPage.login(`admin-${UAJ}@example.net`, 'pix123');
    await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
    await orgaPage.acceptCGU();
  });

  await test.step('Create a campaign', async () => {
    await page.getByRole('link', { name: 'Campagnes', exact: true }).click();
    await page.getByRole('link', { name: 'Créer une campagne' }).click();
    await orgaPage.createEvaluationCampaign({
      campaignName: 'campagne sco',
      targetProfileName: 'PC pour Playwright',
    });
    campaignCode = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';
  });

  await test.step('Import Learners', async () => {
    await page.getByRole('link', { name: 'Élèves' }).click();
    await page.getByRole('link', { name: 'Importer', exact: true }).click();
    await page.locator('#students-file-upload').setInputFiles(path.join(os.tmpdir(), `sco-${UAJ}.xml`));

    const hasLoader = await page.locator('.app-loader').isVisible();
    if (hasLoader) {
      await page.waitForSelector('.app-loader', { state: 'detached' });
    }

    await orgaPage.waitForTheImportToComplete(page);
    await page.getByRole('link', { name: 'Élèves' }).click();
    await expect(
      page.getByRole('paragraph').filter({ hasText: 'Les participants ont bien été importés' }),
    ).toBeVisible();
  });

  await test.step('Can access campaign for re-enabled learner', async function () {
    await page.goto(process.env.PIX_APP_URL + `/campagnes/${campaignCode}`);
    await page.getByRole('button', { name: 'Je commence' }).click();
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await reconciliationLoginPage.login(`katie-${UAJ}@veuns.io`, `katieveuns-password`);
    await expect(page.getByText('Vous pouvez rechercher sur')).toBeVisible();
    await page.getByRole('button', { name: 'Ignorer' }).click();
    await challengePage.leave();
    await homePage.logout();
  });

  await test.step('Can access campaign for auto-reconciled learner from another organization', async function () {
    await page.goto(process.env.PIX_APP_URL + `/campagnes/${campaignCode}`);
    await page.getByRole('button', { name: 'Je commence' }).click();
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await reconciliationLoginPage.login(`alain-${UAJ}@deloin.io`, `alain-deloin-password`);
    await expect(page.getByText('Vous pouvez rechercher sur')).toBeVisible();
    await page.getByRole('button', { name: 'Ignorer' }).click();
    await challengePage.leave();
    await homePage.logout();
  });

  await test.step('Log in using the campaign code', async function () {
    await page.goto(process.env.PIX_APP_URL + `/campagnes/${campaignCode}`);
    await page.getByRole('button', { name: 'Je commence' }).click();
    await reconciliationPage.reconcile('Jaqueline', 'Colson', '03/09/1994', false);
    await expect(page.getByText('Mon identifiant *')).toBeVisible();
    await page.getByRole('textbox', { name: 'Mot de passe * (8 caractères' }).fill('Pix12345');
    await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
    await page.getByRole('button', { name: "Je m'inscris" }).click();
    await expect(page.getByText('Vous pouvez rechercher sur')).toBeVisible();
    await page.getByRole('button', { name: 'Ignorer' }).click();
    await challengePage.leave();
    await homePage.logout();
  });

  await test.step('Log in using GAR', async function () {
    const token = getGarTokenForExistingUser(GARUserId);
    await page.goto(process.env.PIX_APP_URL + `/connexion/gar#${token}`);
    await expect(page.getByRole('link', { name: "J'ai un code" })).toBeVisible();
    await page.getByRole('link', { name: "J'ai un code" }).click();
    await page.getByLabel('Saisir votre code pour').fill(campaignCode);
    await page.getByRole('button', { name: 'Accéder au parcours' }).click();
    await page.getByRole('button', { name: 'Je commence' }).click();
    await expect(page.getByRole('heading', { name: "Rejoignez l'organisation Orga" })).toBeVisible();
    await reconciliationPage.reconcile('Stéphanie', 'Chaire', '03/10/1994', true);
    await expect(page.getByText('Vous pouvez rechercher sur')).toBeVisible();
    await page.getByRole('button', { name: 'Ignorer' }).click();
    await challengePage.leave();
    await homePage.logout(/nonconnecte/);
  });

  await test.step('Show learners', async () => {
    await page.goto(process.env.PIX_ORGA_URL as string);
    await page.getByRole('link', { name: 'Élèves' }).click();

    await expect(
      page.getByRole('paragraph').filter({ hasText: 'Les participants ont bien été importés' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Élèves (5)' })).toBeVisible();
  });

  await test.step('Generate learner password ', async () => {
    await expect(page.getByRole('table', { name: 'Tableau des élèves trié' })).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: 'Identifiant' });
    await row.getByRole('button', { name: 'Afficher les actions' }).click();
    await row.getByRole('button', { name: 'Gérer le compte' }).click();

    const dialog = page.getByRole('dialog', { name: 'Gestion du compte Pix de l’élève' });
    await expect(dialog.getByRole('heading', { name: 'Identifiant' })).toBeVisible();

    await dialog.getByRole('button', { name: 'Réinitialiser le mot de passe' }).click();
    await expect(dialog.getByText('Nouveau mot de passe à usage')).toBeVisible();
    await dialog.getByRole('button', { name: 'Fermer' }).click();
  });

  await test.step('Generate learner password for GAR authenticated learner', async () => {
    await expect(page.getByRole('table', { name: 'Tableau des élèves trié' })).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: 'Mediacentre' });
    await row.getByRole('button', { name: 'Afficher les actions' }).click();
    await row.getByRole('button', { name: 'Gérer le compte' }).click();

    const dialog = page.getByRole('dialog', { name: 'Gestion du compte Pix de l’élève' });
    await expect(dialog.getByText('Médiacentre')).toBeVisible();
    await dialog.getByRole('button', { name: 'Ajouter l’identifiant' }).click();
    await expect(dialog.getByText('Nouveau mot de passe à usage')).toBeVisible();
    await dialog.getByRole('button', { name: 'Fermer' }).click();
  });

  await test.step('No action available for learner not linked to a user', async () => {
    await expect(page.getByRole('table', { name: 'Tableau des élèves trié' })).toBeVisible();
    const row = page.getByRole('row').filter({ hasText: 'Bernard' });
    await expect(row.getByRole('button', { name: 'Afficher les actions' })).not.toBeVisible();
  });
});

test.describe('SCO import does not auto-reconcile a learner when the user already has a different INE in the target organization', () => {
  let UAJ_FREGATA: string;

  const CSV_HEADER =
    "Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d'usage;Code sexe*;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*";

  test.beforeEach(async () => {
    UAJ_FREGATA = randomUUID().slice(-8);

    const { organizationId: orgAId } = await buildFreshPixOrgaUser(
      'Admin',
      'FregataA',
      `admin-fregata-a-${UAJ_FREGATA}@example.net`,
      'pix123',
      'ADMIN',
      { type: 'SCO', externalId: `SCO_FREGATA_A-${UAJ_FREGATA}`, isManagingStudents: true },
    );

    const { organizationId: orgBId } = await buildFreshPixOrgaUser(
      'Admin',
      'FregataB',
      `admin-fregata-b-${UAJ_FREGATA}@example.net`,
      'pix123',
      'ADMIN',
      { type: 'SCO', externalId: `SCO_FREGATA_B-${UAJ_FREGATA}`, isManagingStudents: true },
    );

    let tagRow = await knex('tags').where({ name: 'AGRICULTURE' }).first();
    if (!tagRow) {
      [tagRow] = await knex('tags').insert({ name: 'AGRICULTURE' }).returning('*');
    }
    await knex('organization-tags')
      .insert([
        { organizationId: orgAId, tagId: tagRow.id },
        { organizationId: orgBId, tagId: tagRow.id },
      ])
      .onConflict(['organizationId', 'tagId'])
      .ignore();

    // CSV A : Jean Michel avec INE 12
    await writeFile(
      path.join(os.tmpdir(), `fregata-a-${UAJ_FREGATA}.csv`),
      `${CSV_HEADER}\n12${UAJ_FREGATA};Jean;;;Michel;;Masculin;01/01/1990;75056;;75;99100;ST;1234;CLASSE12\n`,
    );

    // CSV B-initial : Jean Michel avec INE 13 (premier import Org B)
    await writeFile(
      path.join(os.tmpdir(), `fregata-b-${UAJ_FREGATA}.csv`),
      `${CSV_HEADER}\n13${UAJ_FREGATA};Jean;;;Michel;;Masculin;01/01/1990;75056;;75;99100;ST;1234;CLASSE13\n`,
    );
  });

  test.describe('when previous learner reconciled is disabled', () => {
    test.beforeEach(async () => {
      // CSV B-second : Jean Michel avec INE 12 uniquement (INE 13 sera disabled)
      await writeFile(
        path.join(os.tmpdir(), `fregata-b2-${UAJ_FREGATA}.csv`),
        `${CSV_HEADER}\n12${UAJ_FREGATA};Jean;;;Michel;;Masculin;01/01/1990;75056;;75;99100;ST;1234;CLASSE1\n`,
      );
    });

    test('Prevents auto-reconciliation when the user is already in the target organization with a different INE', async ({
      page,
    }) => {
      test.slow();
      const orgaPage = new PixOrgaPage(page);
      const reconciliationPage = new ReconciliationPage(page);
      const challengePage = new ChallengePage(page);
      let campaignCodeA: string;
      let campaignCodeB: string;
      let campaignCodeB2: string;

      await test.step('Organization A: login, create a campaign and import Jean Michel (INE 12)', async () => {
        await page.goto(process.env.PIX_ORGA_URL as string);
        await orgaPage.login(`admin-fregata-a-${UAJ_FREGATA}@example.net`, 'pix123');
        await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
        await orgaPage.acceptCGU();

        await page.getByRole('link', { name: 'Campagnes', exact: true }).click();
        await page.getByRole('link', { name: 'Créer une campagne' }).click();
        await orgaPage.createEvaluationCampaign({
          campaignName: 'campagne fregata A',
          targetProfileName: 'PC pour Playwright',
        });
        campaignCodeA = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';

        await page.getByRole('link', { name: 'Élèves' }).click();
        await page.getByRole('link', { name: 'Importer', exact: true }).click();
        await page
          .locator('#students-file-upload')
          .setInputFiles(path.join(os.tmpdir(), `fregata-a-${UAJ_FREGATA}.csv`));

        const hasLoader = await page.locator('.app-loader').isVisible();
        if (hasLoader) {
          await page.waitForSelector('.app-loader', { state: 'detached' });
        }
        await orgaPage.waitForTheImportToComplete(page);
      });

      await test.step('A user creates an account and reconciles with Jean Michel from Org A (INE 12)', async () => {
        await page.goto(process.env.PIX_APP_URL + `/campagnes/${campaignCodeA}`);
        await page.getByRole('button', { name: 'Je commence' }).click();
        await reconciliationPage.reconcile('Jean', 'Michel', '01/01/1990', false);
        await expect(page.getByText('Mon identifiant *')).toBeVisible();
        await page.getByRole('textbox', { name: 'Mot de passe * (8 caractères' }).fill('Pix12345');
        await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
        await page.getByRole('button', { name: "Je m'inscris" }).click();
        await expect(page.getByText('Vous pouvez rechercher sur')).toBeVisible();
        await page.getByRole('button', { name: 'Ignorer' }).click();
        await challengePage.leave();
      });

      await test.step('Org B: login, create a campaign and import Jean Michel (INE 13)', async () => {
        await page.goto(process.env.PIX_ORGA_URL as string);
        await page.getByRole('link', { name: 'Se déconnecter' }).click();
        await orgaPage.login(`admin-fregata-b-${UAJ_FREGATA}@example.net`, 'pix123');
        await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
        await orgaPage.acceptCGU();

        await page.getByRole('link', { name: 'Campagnes', exact: true }).click();
        await page.getByRole('link', { name: 'Créer une campagne' }).click();
        await orgaPage.createEvaluationCampaign({
          campaignName: 'campagne fregata B',
          targetProfileName: 'PC pour Playwright',
        });
        campaignCodeB = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';

        await page.getByRole('link', { name: 'Élèves' }).click();
        await page.getByRole('link', { name: 'Importer', exact: true }).click();
        await page
          .locator('#students-file-upload')
          .setInputFiles(path.join(os.tmpdir(), `fregata-b-${UAJ_FREGATA}.csv`));

        const hasLoader = await page.locator('.app-loader').isVisible();
        if (hasLoader) {
          await page.waitForSelector('.app-loader', { state: 'detached' });
        }
        await orgaPage.waitForTheImportToComplete(page);
      });

      await test.step('Jean Michel manually reconciles with Org B (INE 13) via the campaign', async () => {
        // INE 13 est inconnu, pas d'auto-réconciliation à l'import : Jean Michel doit se réconcilier manuellement.
        await page.goto(process.env.PIX_APP_URL + `/campagnes/${campaignCodeB}`);
        await page.getByRole('button', { name: 'Je commence' }).click();
        await reconciliationPage.reconcile('Jean', 'Michel', '01/01/1990', true);
        await challengePage.leave();
      });

      await test.step('Org B: second import with INE 12 only — INE 13 is disabled, we block auto-reconciliation of INE 12', async () => {
        // Après cet import : INE 13 sera disabled (absent du CSV), INE 12 sera créé.
        // On détecte que U1 est déjà dans Org B (via INE 13 disabled) avec un INE différent
        // → INE 12 reste sans userId.
        await page.goto(process.env.PIX_ORGA_URL as string);
        await page.getByRole('link', { name: 'Campagnes', exact: true }).click();
        await page.getByRole('link', { name: 'Créer une campagne' }).click();
        await orgaPage.createEvaluationCampaign({
          campaignName: 'campagne fregata B2',
          targetProfileName: 'PC pour Playwright',
        });
        campaignCodeB2 = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';

        await page.getByRole('link', { name: 'Élèves' }).click();
        await page.getByRole('link', { name: 'Importer', exact: true }).click();
        await page
          .locator('#students-file-upload')
          .setInputFiles(path.join(os.tmpdir(), `fregata-b2-${UAJ_FREGATA}.csv`));

        const hasLoader = await page.locator('.app-loader').isVisible();
        if (hasLoader) {
          await page.waitForSelector('.app-loader', { state: 'detached' });
        }
        await orgaPage.waitForTheImportToComplete(page);
      });

      await test.step('Jean Michel cannot access the new Organization B campaign (INE 12 was not auto-reconciled)', async () => {
        await page.goto(process.env.PIX_APP_URL + `/campagnes/${campaignCodeB2}`);
        // Jean Michel est connecté, mais n'est plus réconcilié avec Orga B :
        // - INE 13 est disabled : aucun learner actif avec userId=U1 dans Org B
        // - INE 12 a userId=null
        await page.getByRole('button', { name: 'Je commence' }).click();
        await expect(page.getByRole('heading', { name: /Oups, la page demandée/ })).toBeVisible({ timeout: 15000 });
      });
    });
  });

  test.describe('when previous reconciled learner is still active', () => {
    test.beforeEach(async () => {
      // CSV B-second : Jean Michel avec INE 12 uniquement (INE 13 sera disabled)
      await writeFile(
        path.join(os.tmpdir(), `fregata-a2-${UAJ_FREGATA}.csv`),
        `${CSV_HEADER}\n
        12${UAJ_FREGATA};Jean;;;Michel;;Masculin;01/01/1990;75056;;75;99100;ST;1234;CLASSE12\n
        13${UAJ_FREGATA};Jean;;;Michel;;Masculin;01/01/1990;75056;;75;99100;ST;1234;CLASSE13\n
        `,
      );
    });

    test("Remove user reconciliation when the user is already in the target organization with a different INE, (is it ok, i don't know, but it's here since the beginning of the time)", async ({
      page,
    }) => {
      test.slow();
      const orgaPage = new PixOrgaPage(page);
      const reconciliationPage = new ReconciliationPage(page);
      const challengePage = new ChallengePage(page);
      let campaignCodeA: string;
      let campaignCodeB: string;

      await test.step('Organization A: login, create a campaign and import Jean Michel (INE 12)', async () => {
        await page.goto(process.env.PIX_ORGA_URL as string);
        await orgaPage.login(`admin-fregata-a-${UAJ_FREGATA}@example.net`, 'pix123');
        await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
        await orgaPage.acceptCGU();

        await page.getByRole('link', { name: 'Campagnes', exact: true }).click();
        await page.getByRole('link', { name: 'Créer une campagne' }).click();
        await orgaPage.createEvaluationCampaign({
          campaignName: 'campagne fregata A',
          targetProfileName: 'PC pour Playwright',
        });
        campaignCodeA = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';

        await page.getByRole('link', { name: 'Élèves' }).click();
        await page.getByRole('link', { name: 'Importer', exact: true }).click();
        await page
          .locator('#students-file-upload')
          .setInputFiles(path.join(os.tmpdir(), `fregata-a-${UAJ_FREGATA}.csv`));

        const hasLoader = await page.locator('.app-loader').isVisible();
        if (hasLoader) {
          await page.waitForSelector('.app-loader', { state: 'detached' });
        }
        await orgaPage.waitForTheImportToComplete(page);
        await page.getByRole('link', { name: 'Se déconnecter' }).click();
        await page.getByRole('button', { name: 'Je me connecte' }).waitFor();
      });

      await test.step('A user creates an account and reconciles with Jean Michel from Org A (INE 12)', async () => {
        await page.goto(`${process.env.PIX_APP_URL}/campagnes/${campaignCodeA}`);
        await page.getByRole('button', { name: 'Je commence' }).click();
        await reconciliationPage.reconcile('Jean', 'Michel', '01/01/1990', false);
        await expect(page.getByText('Mon identifiant *')).toBeVisible();
        await page.getByRole('textbox', { name: 'Mot de passe * (8 caractères' }).fill('Pix12345');
        await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
        await page.getByRole('button', { name: "Je m'inscris" }).click();
        await expect(page.getByText('Vous pouvez rechercher sur')).toBeVisible();
        await page.getByRole('button', { name: 'Ignorer' }).click();
        await challengePage.leave();
      });

      await test.step('Org B: login, create a campaign and import Jean Michel (INE 13)', async () => {
        await page.goto(process.env.PIX_ORGA_URL as string);
        await orgaPage.login(`admin-fregata-b-${UAJ_FREGATA}@example.net`, 'pix123');
        await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });
        await orgaPage.acceptCGU();

        await page.getByRole('link', { name: 'Campagnes', exact: true }).click();
        await page.getByRole('link', { name: 'Créer une campagne' }).click();
        await orgaPage.createEvaluationCampaign({
          campaignName: 'campagne fregata B',
          targetProfileName: 'PC pour Playwright',
        });
        campaignCodeB = (await page.locator('dd.campaign-header-title__campaign-code > span').textContent()) ?? '';

        await page.getByRole('link', { name: 'Élèves' }).click();
        await page.getByRole('link', { name: 'Importer', exact: true }).click();
        await page
          .locator('#students-file-upload')
          .setInputFiles(path.join(os.tmpdir(), `fregata-b-${UAJ_FREGATA}.csv`));

        const hasLoader = await page.locator('.app-loader').isVisible();
        if (hasLoader) {
          await page.waitForSelector('.app-loader', { state: 'detached' });
        }
        await orgaPage.waitForTheImportToComplete(page);
        await page.getByRole('link', { name: 'Se déconnecter' }).click();
        await page.getByRole('button', { name: 'Je me connecte' }).waitFor();
      });

      await test.step('Jean Michel manually reconciles with Org B (INE 13) via the campaign', async () => {
        // INE 13 est inconnu, pas d'auto-réconciliation à l'import : Jean Michel doit se réconcilier manuellement.
        await page.goto(process.env.PIX_APP_URL + `/campagnes/${campaignCodeB}`);
        await page.getByRole('button', { name: 'Je commence' }).click();
        await reconciliationPage.reconcile('Jean', 'Michel', '01/01/1990', true);
        await challengePage.leave();
      });

      await test.step('Org A: second import with INE 12 AND INE 13, we remove reconciliation of INE 12', async () => {
        // On détecte que U1 est déjà dans Org B (via INE 13) avec un INE différent
        // → INE 12 reste sans userId.
        // → INE 13 perd son userId.
        await page.goto(process.env.PIX_ORGA_URL as string);
        await orgaPage.login(`admin-fregata-a-${UAJ_FREGATA}@example.net`, 'pix123');
        await page.getByRole('button').filter({ hasText: 'Je me connecte' }).waitFor({ state: 'detached' });

        await page.getByRole('link', { name: 'Campagnes', exact: true }).click();
        await page.getByRole('link', { name: 'Créer une campagne' }).click();
        await orgaPage.createEvaluationCampaign({
          campaignName: 'campagne fregata B2',
          targetProfileName: 'PC pour Playwright',
        });

        await page.getByRole('link', { name: 'Élèves' }).click();
        await page.getByRole('link', { name: 'Importer', exact: true }).click();
        await page
          .locator('#students-file-upload')
          .setInputFiles(path.join(os.tmpdir(), `fregata-a2-${UAJ_FREGATA}.csv`));

        const hasLoader = await page.locator('.app-loader').isVisible();
        if (hasLoader) {
          await page.waitForSelector('.app-loader', { state: 'detached' });
        }
        await orgaPage.waitForTheImportToComplete(page);
        await page.getByRole('link', { name: 'Élèves' }).click();
        await expect(
          page.getByRole('paragraph').filter({ hasText: 'Les participants ont bien été importés' }),
        ).toBeVisible();

        await expect(page.getByRole('cell', { name: 'Aucune' }).nth(0)).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Aucune' }).nth(1)).toBeVisible();
      });
    });
  });
});
