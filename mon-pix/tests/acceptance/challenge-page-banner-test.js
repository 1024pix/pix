import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Challenge page banner', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;
  let campaign;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { title: 'SomeTitle' });
    await authenticate(user);
  });

  module('When user is starting a campaign assessment', function () {
    test('should display a campaign banner', async function (assert) {
      // when
      const screen = await visit(`campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: 'Je commence' }));
      await click(screen.getByRole('button', { name: 'Ignorer' }));

      // then
      assert.dom(screen.getByRole('img', { name: 'pix' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Quitter' })).exists();
    });

    test('should display accessibility information in the banner', async function (assert) {
      // given
      server.create('campaign-participation', { campaign, user, isShared: false, createdAt: Date.now() });

      // when
      const screen = await visit(`campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: 'Ignorer' }));

      // then
      assert.dom(screen.getByRole('heading', { name: "Épreuve pour l'évaluation : SomeTitle", level: 1 })).exists();
    });

    test('should be able to leave the campaign', async function (assert) {
      // when
      const screen = await visit(`campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: 'Je commence' }));
      await click(screen.getByRole('button', { name: 'Ignorer' }));
      await click(screen.getByRole('button', { name: 'Quitter' }));
      await screen.findByRole('dialog');
      await click(screen.getByRole('link', { name: "Quitter l'épreuve et retourner à la page d'accueil" }));

      // then
      assert.strictEqual(currentURL(), '/accueil');
    });
  });

  module('When the assessment is not a certification', function () {
    module('When FT_ENABLE_TEXT_TO_SPEECH_BUTTON is true', function (hooks) {
      let assessment;
      let challenge;

      hooks.beforeEach(function () {
        server.create('feature-toggle', { id: '0', isTextToSpeechButtonEnabled: true });
        challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {
          instruction: 'Instruction à lire',
        });
        assessment = server.create('assessment', 'ofCompetenceEvaluationType', {
          title: 'Assessment title',
          nextChallenge: challenge,
        });
      });

      test('displays deactivated text-to-speech button in challenge instruction', async function (assert) {
        // given
        class MetricsStubService extends Service {
          trackPage = sinon.stub();
          trackEvent = sinon.stub();
          context = {};
        }
        this.owner.register('service:pix-metrics', MetricsStubService);

        // when
        const screen = await visit(`/assessments/${assessment.id}/challenges/${challenge.id}`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Activer la vocalisation' })).exists();
        assert.dom(screen.queryByRole('button', { name: 'Lire la consigne à haute voix' })).doesNotExist();
      });

      test("displays text-to-speech button in challenge instruction when it's been activated in the banner", async function (assert) {
        // given
        class MetricsStubService extends Service {
          trackPage = sinon.stub();
          trackEvent = sinon.stub();
          context = {};
        }
        this.owner.register('service:pix-metrics', MetricsStubService);

        const screen = await visit(`/assessments/${assessment.id}/challenges/${challenge.id}`);

        // when
        await click(screen.getByRole('button', { name: 'Activer la vocalisation' }));

        // then
        assert.dom(screen.getByRole('button', { name: 'Lire la consigne à haute voix' })).exists();
      });
    });
  });
});
