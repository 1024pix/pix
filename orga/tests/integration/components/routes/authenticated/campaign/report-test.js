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
    assert.contains('1234PixTest');
  });

  module('When there is some results', function() {
    test('it should display campaign participants number', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        participationsCount: 10,
      });

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);

      // then
      assert.contains('10');
    });

    test('it should display campaign shared participations number', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        sharedParticipationsCount: 4,
      });
      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);

      // then
      assert.contains('4');
    });
  });

  module('When there is no results', function() {
    test('it should display "-" when no one participated', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        participationsCount: 0,
        sharedParticipationsCount: 2,
      });
      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);

      // then
      assert.contains('-');
    });

    test('it should display "-" when no one shared his participation', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        participationsCount: 4,
        sharedParticipationsCount: 0,
      });
      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);

      // then
      assert.contains('-');
    });
  });

  module('Navigation', function() {

    hooks.beforeEach(function() {
      this.owner.setupRouter();
    });

    test('it should display campaign details item', async function(assert) {

      const campaign = store.createRecord('campaign', {
        id: 12,
      });

      this.set('campaign', campaign);

      await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);
      assert.dom('nav a[href="/campagnes/12"]').hasText('Détails');
    });

    module('When campaign type is ASSESSMENT', function(hooks) {
      hooks.beforeEach(async function() {
        const campaign = store.createRecord('campaign', {
          id: 13,
          participationsCount: 10,
          type: 'ASSESSMENT',
        });

        this.set('campaign', campaign);

        await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);
      });

      test('it should display campaign analyse item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/analyse"]').hasText('Analyse');
      });

      test('it should display participation item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/evaluations"]').hasText('Participants (10)');
      });

      test('it should display collective results item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/resultats-collectifs"]').hasText('Résultats collectifs');
      });
    });

    module('When campaign type is PROFILES_COLLECTION', function(hooks) {
      hooks.beforeEach(async function() {
        // given
        const campaign = store.createRecord('campaign', {
          id: 13,
          type: 'PROFILES_COLLECTION',
        });

        this.set('campaign', campaign);

        await render(hbs`<Routes::Authenticated::Campaign::Report @campaign={{campaign}}/>`);
      });

      test('it should not display participation item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/evaluations"]').doesNotExist();
      });

      test('it should not display analyse item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/analyse"]').doesNotExist();
      });

      test('it should not display collective results item', async function(assert) {
        assert.dom('nav a[href="/campagnes/13/resultats-collectifs"]').doesNotExist();
      });
    });
  });
});
