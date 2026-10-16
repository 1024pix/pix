import { visit } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { authenticate } from '../helpers/authentication';

module('Acceptance | Application', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  hooks.beforeEach(async function () {
    this.owner.lookup('service:store');
  });

  module('analytics', function (hooks) {
    hooks.beforeEach(async function () {
      class MetricServiceStub extends Service {
        trackPage = sinon.stub();
        activateAdapters = sinon.stub();
        context = {};
      }

      this.owner.register('service:metrics', MetricServiceStub);
    });

    test('should trackPage', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');
      const user = this.server.create('user', 'withEmail');
      await authenticate(user);

      // when
      await visit('/');

      // then
      assert.ok(
        metricService.trackPage.calledOnceWithExactly({
          plausibleAttributes: { u: `${new URL(window.location).origin}/accueil` },
        }),
      );
    });

    test('should not track redirected page', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');
      server.create('assessment', 'ofCompetenceEvaluationType', {
        id: 1,
      });
      server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {});

      // when
      await visit('/competences/1/evaluer');

      // then
      assert.ok(metricService.trackPage.calledOnce);
    });

    test('should rewrite id in URL', async function (assert) {
      // given
      const challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {});
      server.create('assessment', 'ofCompetenceEvaluationType', {
        nextChallenge: challenge,
        id: 1,
      });

      const metricService = this.owner.lookup('service:metrics');
      await visit('/assessments/1/challenges/0');
      sinon.assert.calledOnceWithExactly(metricService.trackPage, {
        plausibleAttributes: { u: `${new URL(window.location).origin}/assessments/_ID_/challenges/_ID_` },
      });
      assert.ok(true);
    });

    test('should ignore unknown route', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');
      // when
      await visit('/unknown-url');

      // then
      sinon.assert.calledOnceWithExactly(metricService.trackPage, {
        plausibleAttributes: { u: `${new URL(window.location).origin}/connexion` },
      });

      assert.ok(true);
    });

    test('should forward query params', async function (assert) {
      // given
      const metricService = this.owner.lookup('service:metrics');
      const challenge = server.create('challenge', 'forCompetenceEvaluation', 'QROCM', {});
      server.create('assessment', 'ofCompetenceEvaluationType', {
        id: 1,
        nextChallenge: challenge,
      });

      // when
      await visit('/assessments/1/challenges/0?id=1');

      // then
      sinon.assert.calledOnceWithExactly(metricService.trackPage, {
        plausibleAttributes: { u: `${new URL(window.location).origin}/assessments/_ID_/challenges/_ID_?id=1` },
      });

      assert.ok(true);
    });
  });

  module('When there are no information banners', function () {
    test('it should not display any banner', async function (assert) {
      // given
      server.create('information-banner', 'withoutBanners', { id: 'pix-app-local' });

      // when
      const screen = await visit(`/`);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });
  });

  module('When there is an information banner', function () {
    test('it should display it', async function (assert) {
      // given
      const banner = server.create('banner', {
        id: 'pix-app-local:1',
        severity: 'info',
        message: '[en]some text[/en][fr]du texte[/fr]',
      });
      server.create('information-banner', { id: 'pix-app-local', banners: [banner] });

      // when
      const screen = await visit(`/`);
      // then
      assert.dom(screen.getByRole('alert')).exists();
    });
  });
});
