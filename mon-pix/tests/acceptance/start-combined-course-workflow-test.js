import { fillByLabel, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Combined course | Start Combined course workflow', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  async function _loginUser(screen, user) {
    await click(screen.getByRole('link', { name: 'Se connecter' }));
    await fillIn(screen.getByLabelText('Adresse e-mail ou identifiant', { exact: false }), user.email);
    await fillIn(screen.getByLabelText('Mot de passe', { exact: false }), user.password);
    await click(screen.getByRole('button', { name: 'Je me connecte' }));
  }

  module('when user is not logged in', function (hooks) {
    let combinedCourse;

    hooks.beforeEach(function () {
      combinedCourse = server.create('combined-course', { code: 'COMBINIX1', organizationId: 1 });
      server.create('verified-code', { id: 'COMBINIX1', type: 'combined-course', combinedCourse });
      server.create('organization-to-join', { id: 1, isRestricted: false, code: combinedCourse.code });
    });

    module('when user tries to access join url', function () {
      module('when user tries to access course as anonymous', function () {
        test('should redirect to connection page', async function (assert) {
          await visit(`organizations/${combinedCourse.code}/rejoindre/anonyme`);
          assert.strictEqual(currentURL(), `/connexion`);
        });
      });
      module('when user tries to access student-sco', function () {
        test('should redirect to connection page', async function (assert) {
          await visit(`organizations/${combinedCourse.code}/rejoindre/identification`);
          assert.strictEqual(currentURL(), `/connexion`);
        });
      });
      module('when user tries to access sco-mediacentre', function () {
        test('should redirect to connection page', async function (assert) {
          await visit(`organizations/${combinedCourse.code}/rejoindre/mediacentre`);
          assert.strictEqual(currentURL(), `/connexion`);
        });
      });
    });
    module('when user tries to access invited url', function () {
      test('should redirect to connection page', async function (assert) {
        await visit(`organizations/${combinedCourse.code}/prescrit`);
        assert.strictEqual(currentURL(), `/connexion`);
      });
      module('when user tries to access reconciliation page directly', function () {
        test('should redirect to connection page', async function (assert) {
          await visit(`organizations/${combinedCourse.code}/invited/enregistrement`);
          assert.strictEqual(currentURL(), `/connexion`);
        });
      });
      module('when user tries to access student-sco as invited', function () {
        test('should redirect to connection page', async function (assert) {
          await visit(`organizations/${combinedCourse.code}/invited/eleve`);
          assert.strictEqual(currentURL(), `/connexion`);
        });
      });
      module('when user tries to access sco-mediacentre as invited', function () {
        test('should redirect to connection page', async function (assert) {
          await visit(`organizations/${combinedCourse.code}/invited/etudiant`);
          assert.strictEqual(currentURL(), `/connexion`);
        });
      });
    });
    module('when combinedCourse is found', function () {
      test('should redirect to login page before accessing combined course page', async function (assert) {
        //given
        const user = server.create('user', 'withEmail', { hasSeenAssessmentInstructions: false });
        // when
        const screen = await visit('/parcours/COMBINIX1');
        await _loginUser(screen, user);

        assert.strictEqual(currentURL(), '/parcours/COMBINIX1');
      });
    });
  });
  module('when user is logged in', function () {
    let campaign;
    let combinedCourse;
    let combinedCourseCampaignItem;
    let combinedCourseModuleItem;

    module('when organization is restricted', function (hooks) {
      hooks.beforeEach(async function () {
        const prescritUser = server.create('user', 'withEmail', {
          pixAppTermsOfServiceStatus: 'accepted',
        });

        await authenticate(prescritUser);
        campaign = server.create('campaign', { code: 'ABCDIAG', organizationId: 1 });
        const module = server.create('module', {
          id: 'combinix-slug',
          shortId: 'm4tth74s',
          slug: 'combinix-slug',
          title: 'combinix-title',
          details: { tabletSupport: 'comfortable' },
        });
        combinedCourseCampaignItem = server.create('combined-course-item', {
          title: 'Diagnostique',
          reference: campaign.code,
          type: 'CAMPAIGN',
        });
        combinedCourseModuleItem = server.create('combined-course-item', {
          title: module.title,
          reference: module.slug,
          type: 'MODULE',
          shortId: 'm4tth74s',
        });
        combinedCourse = server.create('combined-course', {
          code: 'COMBINIX1',
          organizationId: 1,
          items: [combinedCourseCampaignItem, combinedCourseModuleItem],
        });
        server.create('verified-code', { id: 'COMBINIX1', type: 'combined-course', combinedCourse });
        server.create('organization-to-join', { id: 1, isRestricted: true, type: 'SCO', code: combinedCourse.code });
      });

      module('When association is not already done', function () {
        test('should redirect to reconciliation page', async function (assert) {
          //when
          await visit('/parcours/COMBINIX1');

          //then
          assert.strictEqual(currentURL(), '/organisations/COMBINIX1/prescrit/eleve');
        });

        module('when using fill in code page', function () {
          test('should redirect to sco reconciliation page', async function (assert) {
            //given
            const screen = await visit('/campagnes');

            //when
            await fillByLabel(`${t('pages.fill-in-campaign-code.label')} *`, 'COMBINIX1');
            await click(screen.getByRole('button', { name: t('pages.fill-in-campaign-code.start') }));

            //then
            assert.strictEqual(currentURL(), '/organisations/COMBINIX1/prescrit/eleve');
          });
        });
      });
      module('when user is reconciled', function () {
        module('when user clicks on campaign item', function () {
          test('it redirects to campaign landing page', async function (assert) {
            //given
            server.create('sco-organization-learner', {
              campaignCode: campaign.code,
              organizationId: 1,
            });

            const screen = await visit('/parcours/COMBINIX1');

            //when
            await click(screen.getByText(combinedCourseCampaignItem.title));

            //then
            assert.strictEqual(currentURL(), '/campagnes/ABCDIAG/presentation');
          });
        });

        module('when user clicks on module item', function () {
          test('it redirects to module landing page', async function (assert) {
            //given
            server.create('sco-organization-learner', {
              campaignCode: campaign.code,
              organizationId: 1,
            });

            const screen = await visit('/parcours/COMBINIX1');

            //when
            await click(screen.getByText(combinedCourseModuleItem.title));
            //then
            assert.strictEqual(currentURL(), '/modules/m4tth74s/combinix-slug/details');
          });
        });
      });
      module('When verified code type is campaign', function () {
        test('should redirect to campaign', async function (assert) {
          // given
          server.create('campaign', {
            code: 'CAMPAIGN',
            organizationId: 1,
            items: [],
          });

          // when
          await visit('/parcours/CAMPAIGN');

          // then
          assert.strictEqual(currentURL(), '/campagnes/CAMPAIGN/evaluation/didacticiel');
        });
      });
    });
  });
});
