import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | parameters-tab', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  module('on TargetProfile display', function() {
    module('when type is TEST_GIVEN', function() {
      test('it should display target profile related to campaign', async function(assert) {
        // given
        const targetProfile = store.createRecord('targetProfile', {
          name: 'profil cible de la campagne 1',
        });
        const campaign = store.createRecord('campaign', {
          type: 'TEST_GIVEN',
          targetProfile
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::Details::ParametersTab @campaign={{campaign}}/>`);

        // then
        assert.dom('[aria-label="Détails de la campagne"]').includesText('profil cible de la campagne 1');
      });
    });

    module('when type is PROFILES_COLLECTION', function() {
      test('it should not display target profile', async function(assert) {
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION'
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::Details::ParametersTab @campaign={{campaign}}/>`);

        // then
        assert.dom('[aria-label="Détails de la campagne"]').doesNotHaveTextContaining('Profil cible');
      });
    });
  });

  module('on idPixLabel display', function() {
    module('when idPixLabel is set', function() {
      test('it should display the idPixLabel', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          idPixLabel: 'idPixLabel'
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::Details::ParametersTab @campaign={{campaign}}/>`);

        // then
        assert.dom('[aria-label="Détails de la campagne"]').includesText('idPixLabel');
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
        await render(hbs`<Routes::Authenticated::Campaigns::Details::ParametersTab @campaign={{campaign}}/>`);

        // then
        assert.dom('[aria-label="Détails de la campagne"]').doesNotContainText('Libellé de l\'identifiant');
      });
    });
  });

  module('on campaign url display', function() {
    test('it should display the campaign url', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        url: 'pix.fr/1234'
      });

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::Details::ParametersTab @campaign={{campaign}}/>`);

      // then
      assert.dom('[aria-label="Détails de la campagne"]').includesText('pix.fr/1234');
    });
  });
});
