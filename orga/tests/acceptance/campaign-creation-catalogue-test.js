import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Campaign Creation (catalogue)', function (hooks) {
  let availableTargetProfiles;
  let availableCombinedCourseBlueprints;

  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function () {
    server.create('feature-toggle', { id: '0', displayCatalogue: true });

    availableCombinedCourseBlueprints = server.createList('course', 2, { type: 'blueprint' });
    availableCombinedCourseBlueprints.forEach((course) => {
      server.create('combined-course-blueprint-overview', { id: course.id, name: course.name });
      server.create('combined-course-blueprint', { id: course.id, name: course.name });
    });

    availableTargetProfiles = server.createList('course', 2, { type: 'targetProfile' });
    availableTargetProfiles.forEach((course) => {
      server.create('target-profile-overview', { id: course.id, name: course.name });
      server.create('target-profile', { id: course.id, name: course.name });
    });
  });

  test('it should not be accessible by an unauthenticated user', async function (assert) {
    // when
    await visit('/campagnes/creation-catalogue');

    // then
    assert.strictEqual(currentURL(), '/connexion');
  });

  test('it should allow to create a combined course and redirect to the newly created combined course', async function (assert) {
    // given
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    server.create('member-identity', { id: user.id, firstName: user.firstName, lastName: user.lastName });
    createPrescriberByUser({ user });

    await authenticateSession(user.id);

    const expectedCombinedCourseBlueprintName = availableCombinedCourseBlueprints[1].name;

    const screen = await visit('/campagnes/creation-catalogue');

    await click(
      screen.getByRole('link', {
        name: t('pages.campaign-creation.course-selection-label'),
      }),
    );

    await click(
      screen.getByRole('link', {
        name: t('pages.catalogue.modal.open-modal', { name: expectedCombinedCourseBlueprintName }),
      }),
    );

    const dialog = await screen.findByRole('dialog');
    await click(within(dialog).getByRole('link', { name: t('pages.catalogue.modal.select-course') }));

    await fillByLabel('Nom de la campagne *', 'Mon parcours combiné');

    // when
    await clickByName('Créer la campagne');

    // then
    assert.strictEqual(server.db.campaigns[0].name, 'Mon parcours combiné');
    assert.strictEqual(currentURL(), `/parcours/${server.db.campaigns[0].id}`);
  });

  module('when the prescriber is authenticated', (hooks) => {
    hooks.beforeEach(async () => {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      server.create('member-identity', { id: user.id, firstName: user.firstName, lastName: user.lastName });
      createPrescriberByUser({ user });

      await authenticateSession(user.id);
    });

    hooks.afterEach(function () {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    test('it should be accessible for an authenticated prescriber', async function (assert) {
      // when
      const screen = await visit('/campagnes/creation-catalogue');

      // then
      assert.strictEqual(currentURL(), '/campagnes/creation-catalogue');
      assert.ok(screen.getByText("Création d'une campagne"));
    });

    test('it should allow to create a campaign of type ASSESSMENT and redirect to the newly created campaign', async function (assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;
      const expectedTargetProfileName = availableTargetProfiles[1].name;

      const screen = await visit('/campagnes/creation-catalogue');

      await click(
        screen.getByRole('link', {
          name: t('pages.campaign-creation.course-selection-label'),
        }),
      );

      await click(
        screen.getByRole('link', {
          name: t('pages.catalogue.modal.open-modal', { name: expectedTargetProfileName }),
        }),
      );
      const dialog = await screen.findByRole('dialog');
      await click(within(dialog).getByRole('link', { name: t('pages.catalogue.modal.select-course') }));

      await fillByLabel('Nom de la campagne *', 'Ma Campagne');

      const externalIdentifier = screen
        .getByText('Souhaitez-vous demander un identifiant externe ?', { selector: 'legend' })
        .closest('fieldset');
      const element = within(externalIdentifier).getByRole('radio', { name: 'Non' });
      await click(element);

      // when
      await clickByName('Créer la campagne');

      // then
      const firstCampaign = server.db.campaigns[0];
      assert.strictEqual(firstCampaign.name, 'Ma Campagne');
      assert.strictEqual(firstCampaign.targetProfileId, expectedTargetProfileId);
      assert.strictEqual(currentURL(), '/campagnes/1/parametres');
    });

    test('it should allow to create a campaign of type PROFILES_COLLECTION and redirect to the newly created campaign', async function (assert) {
      // given
      const screen = await visit('/campagnes/creation-catalogue');
      await fillByLabel('Nom de la campagne *', 'Ma Campagne');
      await clickByName('Collecter les profils Pix des participants');
      const externalIdentifier = screen
        .getByText('Souhaitez-vous demander un identifiant externe ?', { selector: 'legend' })
        .closest('fieldset');
      const element = within(externalIdentifier).getByRole('radio', { name: 'Non' });
      await click(element);

      // when
      await clickByName('Créer la campagne');

      // then
      assert.strictEqual(server.db.campaigns[0].name, 'Ma Campagne');
      assert.strictEqual(currentURL(), '/campagnes/1/parametres');
    });

    test('it should create campaign if user changes type after filling the form', async function (assert) {
      // given
      const expectedTargetProfileName = availableTargetProfiles[1].name;

      const screen = await visit('/campagnes/creation-catalogue');

      await click(
        screen.getByRole('link', {
          name: t('pages.campaign-creation.course-selection-label'),
        }),
      );

      await click(
        screen.getByRole('link', {
          name: t('pages.catalogue.modal.open-modal', { name: expectedTargetProfileName }),
        }),
      );
      const dialog = await screen.findByRole('dialog');
      await click(within(dialog).getByRole('link', { name: t('pages.catalogue.modal.select-course') }));

      await fillByLabel('Nom de la campagne *', 'Ma Campagne');

      const title = `${t('pages.campaign-creation.test-title.label')} ${t('pages.campaign-creation.test-title.sublabel')}`;

      await fillByLabel(title, 'Savoir rechercher');
      await clickByName('Non');

      // when
      await clickByName(t('pages.campaign-creation.actions.create'));

      // then
      assert.strictEqual(server.db.campaigns[0].name, 'Ma Campagne');
      assert.strictEqual(currentURL(), '/campagnes/1/parametres');
    });

    test('it should set the current user as owner by default when creating a campaign', async function (assert) {
      // given
      const targetProfileName = availableTargetProfiles[1].name;
      const screen = await visit('/campagnes/creation-catalogue');

      await click(
        screen.getByRole('link', {
          name: t('pages.campaign-creation.course-selection-label'),
        }),
      );

      await click(
        screen.getByRole('link', {
          name: t('pages.catalogue.modal.open-modal', { name: targetProfileName }),
        }),
      );
      const dialog = await screen.findByRole('dialog');
      await click(within(dialog).getByRole('link', { name: t('pages.catalogue.modal.select-course') }));

      await fillByLabel('Nom de la campagne *', 'Ma Campagne');

      // when
      await clickByName('Créer la campagne');

      // then
      assert.ok(screen.getByText('Harry Cover', { selector: 'dd' }));
    });

    test('it should display error on global form when error 500 is returned from backend', async function (assert) {
      // given
      const screen = await visit('/campagnes/creation-catalogue');

      const expectedTargetProfileName = availableTargetProfiles[1].name;
      server.post('/campaigns', {}, 500);

      // when
      await click(
        screen.getByRole('link', {
          name: t('pages.campaign-creation.course-selection-label'),
        }),
      );

      await click(
        screen.getByRole('link', {
          name: t('pages.catalogue.modal.open-modal', { name: expectedTargetProfileName }),
        }),
      );
      const dialog = await screen.findByRole('dialog');
      await click(within(dialog).getByRole('link', { name: t('pages.catalogue.modal.select-course') }));

      await fillByLabel('Nom de la campagne *', 'Ma Campagne');
      const externalIdentifier = screen
        .getByText('Souhaitez-vous demander un identifiant externe ?', { selector: 'legend' })
        .closest('fieldset');
      const element = within(externalIdentifier).getByRole('radio', { name: 'Non' });
      await click(element);
      await clickByName('Créer la campagne');

      // then
      assert.strictEqual(currentURL(), '/campagnes/creation-catalogue?courseId=4');
      assert.ok(screen.getByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'));
    });
  });
});
