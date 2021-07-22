import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  prescriber = {
    lang: 'fr',
  }
}

module('Integration | Component | routes/authenticated/campaign/report', function(hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    this.owner.register('service:current-user', CurrentUserStub);
    this.owner.lookup('service:current-user', CurrentUserStub);
  });

  test('it should display campaign name', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      name: 'campagne 1',
    });
    this.set('campaign', campaign);

    // when
    await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);

    // then
    assert.contains('campagne 1');
  });

  test('it should display campaign code', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      code: '1234PixTest',
    });

    this.set('campaign', campaign);

    // when
    await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);

    // then
    assert.dom('.campaign-details-header-report__campaign-code').containsText('1234PixTest');
  });

  test('it should display the creation date and the campaign creator', async function(assert) {
    // given
    const campaign = store.createRecord('campaign', {
      createdAt: new Date('2021-04-14'),
      creatorLastName: 'Fa',
      creatorFirstName: 'Mulan',
      participationsCount: 10,
    });
    this.set('campaign', campaign);

    // when
    await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);

    // then
    assert.contains('Mulan Fa');
    assert.contains('14/04/2021');
  });

  module('Navigation', function(hooks) {

    hooks.beforeEach(async function() {
      this.owner.setupRouter();
      const campaign = store.createRecord('campaign', {
        id: 12,
      });

      this.set('campaign', campaign);
      await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);
    });

    test('it should display campaign settings item', async function(assert) {
      assert.dom('nav a[href="/campagnes/12/details"]').hasText('Paramètres');
    });

    test('it should display activity item', async function(assert) {
      assert.dom('nav a[href="/campagnes/12"]').hasText('Activité');
    });

    module('When campaign type is ASSESSMENT', function(hooks) {
      hooks.beforeEach(async function() {
        const campaign = store.createRecord('campaign', {
          id: 13,
          sharedParticipationsCount: 10,
          type: 'ASSESSMENT',
        });

        this.set('campaign', campaign);

        await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);
      });

      test('it should display campaign analyse item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/analyse"]').hasText('Analyse');
      });

      test('it should display evaluation results item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/resultats-evaluation"]').hasText('Résultats (10)');
      });
    });

    module('When campaign type is PROFILES_COLLECTION', function(hooks) {
      hooks.beforeEach(async function() {
        // given
        const campaign = store.createRecord('campaign', {
          id: 13,
          type: 'PROFILES_COLLECTION',
          sharedParticipationsCount: 6,
        });

        this.set('campaign', campaign);

        await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);
      });

      test('it should display profile results item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/profils"]').hasText('Résultats (6)');
      });

      test('it should not display participation item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/evaluations"]').doesNotExist();
      });

      test('it should not display analyse item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/analyse"]').doesNotExist();
      });

      test('it should not display evaluation results item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/resultats-evaluation"]').doesNotExist();
      });
    });
  });
});
