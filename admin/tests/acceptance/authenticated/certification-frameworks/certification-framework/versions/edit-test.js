import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Framework | item | Framework | edit', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const BASE_I18N_KEY = 'components.certification-frameworks.certification-framework.versions.edit';

  hooks.beforeEach(function () {
    const versionSummaries = [];
    versionSummaries.push(
      server.create('certification-version-summary', {
        id: 13,
        scope: 'CORE',
        startDate: new Date('2023-10-10'),
        expirationDate: null,
        assessmentDuration: 90,
        maximumAssessmentLength: 32,
        status: 'active',
      }),
    );
    versionSummaries.push(
      server.create('certification-version-summary', {
        id: 14,
        scope: 'CORE',
        startDate: null,
        expirationDate: null,
        assessmentDuration: 66,
        maximumAssessmentLength: 67,
        status: 'draft',
      }),
    );
    versionSummaries.push(
      server.create('certification-version-summary', {
        id: 15,
        scope: 'CORE',
        startDate: new Date('2020-01-01'),
        expirationDate: new Date('2021-01-01'),
        assessmentDuration: 90,
        maximumAssessmentLength: 32,
        status: 'archived',
      }),
    );
    server.create('certification-framework', { id: 'CORE', versionSummaries });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    module('when user edit and save the changes', function () {
      test('should persist modifications on the version and be visible in details page', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const screen = await visit(`/certification-frameworks/CORE`);
        await clickByName('Éditer la version 14');

        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.start-date-label`), {
            exact: false,
          }),
          '2026-01-01',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.assessment-duration-label`), {
            exact: false,
          }),
          '01:30',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.default-probability-to-pick-challenge-label`), {
            exact: false,
          }),
          '20',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.variation-percent-label`), {
            exact: false,
          }),
          '0.35',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.default-candidate-capacity-label`), {
            exact: false,
          }),
          '-2',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.maximum-assessment-length-label`), {
            exact: false,
          }),
          '22',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.minimum-answers-required-for-validation-label`), {
            exact: false,
          }),
          '11',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.challenges-between-same-competence-label`), {
            exact: false,
          }),
          '3',
        );
        await clickByName(new RegExp(t(`${BASE_I18N_KEY}.limit-to-one-question-per-tube-label`)));
        await clickByName(new RegExp(t(`${BASE_I18N_KEY}.enable-passage-by-all-competences-label`)));
        await clickByName('Enregistrer pour plus tard');

        assert.dom(screen.getByText(t(`${BASE_I18N_KEY}.success-notification`))).exists();
        await clickByName('Voir les détails de la version 14');
        const attributesList = within(screen.getByLabelText('Paramètres référentiel'));
        assert
          .dom(attributesList.getByText('Statut', { exact: false }).nextElementSibling)
          .hasText("En cours d'édition");
        assert.dom(attributesList.getByText('Durée (min)', { exact: false }).nextElementSibling).hasText('1h 30min');
        assert
          .dom(attributesList.getByText('Nombre max de questions', { exact: false }).nextElementSibling)
          .hasText('22');
        assert
          .dom(attributesList.getByText('Nombre min de réponses', { exact: false }).nextElementSibling)
          .hasText('11');
      });
    });

    module('when user edit and cancel the changes', function () {
      test('should cancel modifications on the version and display old values', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
        const screen = await visit(`/certification-frameworks/CORE`);
        await clickByName('Éditer la version 14');

        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.assessment-duration-label`), {
            exact: false,
          }),
          '03:59',
        );
        await fillIn(
          screen.getByLabelText(t(`${BASE_I18N_KEY}.maximum-assessment-length-label`), {
            exact: false,
          }),
          '111',
        );
        await clickByName('Annuler');

        await clickByName('Voir les détails de la version 14');
        const attributesList = within(screen.getByLabelText('Paramètres référentiel'));
        assert
          .dom(attributesList.getByText('Statut', { exact: false }).nextElementSibling)
          .hasText("En cours d'édition");
        assert.dom(attributesList.getByText('Durée (min)', { exact: false }).nextElementSibling).hasText('1h 6min');
        assert
          .dom(attributesList.getByText('Nombre max de questions', { exact: false }).nextElementSibling)
          .hasText('67');
      });
    });

    module('when trying to edit a non-draft version', function () {
      test('redirects to versions list', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/13/edit`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');

        await visit(`/certification-frameworks/CORE/versions/15/edit`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });

    module('when trying to click on next button', function () {
      test('redirects to calibration page', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/14/edit`);
        await clickByName('Suivant');
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE/versions/14/calibration');
      });
    });
  });

  module('when admin member doesn\'t have the role "SUPER ADMIN"', function () {
    test('should be redirected to the framework-history list ', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: false })(server);
      await visit(`/certification-frameworks/CORE/versions/14/edit`);
      assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
    });
  });
});
