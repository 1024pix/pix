import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  prescriber = {
    lang: 'fr',
  };
}

module('Integration | Component | Campaign::Header::Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.owner.register('service:current-user', CurrentUserStub);
    this.owner.lookup('service:current-user', CurrentUserStub);
    this.owner.setupRouter();
  });

  module('Common campaign navigation', function (hooks) {
    hooks.beforeEach(async function () {
      this.campaign = store.createRecord('campaign', { id: 12 });
      await render(hbs`<Campaign::Header::Tabs @campaign={{this.campaign}} />`);
    });

    test('it should display campaign settings item', async function (assert) {
      assert.dom('nav a[href="/campagnes/12/parametres"]').hasText('Paramètres');
    });

    test('it should display activity item', async function (assert) {
      assert.dom('nav a[href="/campagnes/12"]').hasText('Activité');
    });
  });

  module('When campaign type is ASSESSMENT', function (hooks) {
    hooks.beforeEach(async function () {
      this.campaign = store.createRecord('campaign', {
        id: 13,
        sharedParticipationsCount: 10,
        type: 'ASSESSMENT',
      });

      await render(hbs`<Campaign::Header::Tabs @campaign={{this.campaign}} />`);
    });

    test('it should display evaluation results item', async function (assert) {
      assert.dom('nav a[href="/campagnes/13/resultats-evaluation"]').hasText('Résultats (10)');
    });

    test('it should display campaign analyse item', async function (assert) {
      assert.dom('nav a[href="/campagnes/13/analyse"]').hasText('Analyse');
    });
  });

  module('When campaign type is PROFILES_COLLECTION', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 13,
        type: 'PROFILES_COLLECTION',
        sharedParticipationsCount: 6,
      });

      await render(hbs`<Campaign::Header::Tabs @campaign={{this.campaign}} />`);
    });

    test('it should display profile results item', async function (assert) {
      assert.dom('nav a[href="/campagnes/13/profils"]').hasText('Résultats (6)');
    });

    test('it should not display participation item', async function (assert) {
      assert.dom('nav a[href="/campagnes/13/evaluations"]').doesNotExist();
    });

    test('it should not display analyse item', async function (assert) {
      assert.dom('nav a[href="/campagnes/13/analyse"]').doesNotExist();
    });

    test('it should not display evaluation results item', async function (assert) {
      assert.dom('nav a[href="/campagnes/13/resultats-evaluation"]').doesNotExist();
    });
  });
});
