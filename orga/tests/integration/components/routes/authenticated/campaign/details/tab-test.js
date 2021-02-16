import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | routes/authenticated/campaign/details/tab', function(hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  class UrlStub extends Service {
    campaignsRootUrl = 'root-url/';
  }

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    this.owner.register('service:url', UrlStub);
  });

  module('on TargetProfile display', function() {
    module('when type is ASSESSMENT', function() {
      test('it should display target profile related to campaign', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileName: 'profil cible de la campagne 1',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.contains('profil cible de la campagne 1');
      });
    });

    module('when type is PROFILES_COLLECTION', function() {
      test('it should not display target profile', async function(assert) {
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.notContains('Profil cible');
      });
    });
  });

  module('on idPixLabel display', function() {
    module('when idPixLabel is set', function() {
      test('it should display the idPixLabel', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          idPixLabel: 'idPixLabel',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.contains('idPixLabel');
      });
    });

    module('when idPixLabel is not set', function() {
      test('it should not display the idPixLabel', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          idPixLabel: null,
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.notContains('Libellé de l\'identifiant');
      });
    });
  });

  module('on campaign url display', function() {
    test('it should display the campaign url', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', { code: '1234' });

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

      // then
      assert.contains('root-url/1234');
    });
  });

  module('on campaign title display', function() {
    module('when type is ASSESSMENT', function() {
      test('it should display the campaign title', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          title: 'Mon titre de Campagne',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.contains('Mon titre de Campagne');
      });
    });

    module('when type is PROFILES_COLLECTION', function() {
      test('it should not display the campaign title', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.notContains('Titre du parcours');
      });
    });
  });

  module('on Archived action display', function() {
    test('it should display the button archived', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', { isArchived: false });

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

      // then
      assert.contains('Archiver');
    });
  });

  module('on Modify action display', function() {
    module('when the campaign is not archived', function() {
      test('it should display the button modify', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', { isArchived: false });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.contains('Modifier');
      });
    });

    module('when the campaign is archived', function() {
      test('it should not display the button modify', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', { isArchived: true });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaign::Details::Tab @campaign={{campaign}}/>`);

        // then
        assert.notContains('Modifier');
      });
    });
  });
});
