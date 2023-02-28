import { click, fillIn, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { resumeCampaignOfTypeAssessmentByCode } from '../helpers/campaign';
import { invalidateSession } from '../helpers/invalidate-session';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

const ASSESSMENT = 'ASSESSMENT';

module('Acceptance | Campaigns | Resume Campaigns with type Assessment', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let campaign;
  let studentInfo;

  hooks.beforeEach(async function () {
    studentInfo = server.create('user', 'withEmail');
    await authenticate(studentInfo);
    campaign = server.create('campaign', { idPixLabel: 'email', type: ASSESSMENT });
    await resumeCampaignOfTypeAssessmentByCode(campaign.code, true);
  });

  module('When the user is not logged', function () {
    test('should propose to signup', async function (assert) {
      // given
      await invalidateSession();
      const screen = await visit(`/campagnes/${campaign.code}`);

      // when
      await click(screen.getByRole('button', { name: 'Je commence' }));

      // then
      assert.ok(currentURL().includes('/inscription'));
    });

    test('should redirect to campaign participation when user logs in', async function (assert) {
      // given
      await invalidateSession();
      const screen = await visit(`/campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: 'Je commence' }));
      await click(screen.getByRole('link', { name: 'connectez-vous à votre compte' }));
      await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), studentInfo.email);
      await fillIn(screen.getByLabelText('Mot de passe'), studentInfo.password);

      // when
      await click(screen.getByRole('button', { name: 'Je me connecte' }));

      // then
      assert.ok(currentURL().includes('/assessments/'));
    });
  });

  module('When user is logged', function () {
    module('When there is no more questions', function () {
      test('should redirect to last checkpoint page', async function (assert) {
        // given & when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes('/checkpoint?finalCheckpoint=true'));
      });
    });

    module('When user has completed his campaign participation', function () {
      test('should redirect directly to results', async function (assert) {
        // given
        const screen = await visit(`/campagnes/${campaign.code}`);
        await click(screen.getByRole('link', { name: 'Voir mes résultats' }));

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes(`/campagnes/${campaign.code}/evaluation/resultats`));
      });
    });

    module('When user has already send his results', function () {
      test('should redirect directly to shared results', async function (assert) {
        // given
        const screen = await visit(`/campagnes/${campaign.code}`);
        await click(screen.getByRole('link', { name: 'Voir mes résultats' }));
        await click(screen.getByRole('button', { name: "J'envoie mes résultats" }));

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes(`/campagnes/${campaign.code}/evaluation/resultats`));
      });
    });

    module('When the campaign is restricted and organization learner is disabled', function (hooks) {
      hooks.beforeEach(async function () {
        campaign = server.create('campaign', { code: 'FORBIDDEN', isRestricted: true, type: ASSESSMENT });
        server.create('campaign-participation', { campaign });
      });

      test('should be able to resume', async function (assert) {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        assert.ok(currentURL().includes('/assessments/'));
      });

      test('should display results page', async function (assert) {
        // when
        const screen = await visit(`/campagnes/${campaign.code}`);
        await click(screen.getByRole('link', { name: 'Voir mes résultats' }));

        // then
        assert.ok(currentURL().includes(`/campagnes/${campaign.code}/evaluation/resultats`));
      });
    });
  });
});
