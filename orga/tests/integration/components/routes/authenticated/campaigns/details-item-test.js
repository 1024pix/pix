import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign | details-item', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display campaign details', async function(assert) {
    // given
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-header__title').hasText('campagne 1');
  });

  module('Campaign details header', function() {
    test('it should display the campaign report', async function(assert) {
      // given
      const campaignReport = run(() => store.createRecord('campaignReport', {
        id: 1,
        participationsCount: 10,
        sharedParticipationsCount: 4,
      }));
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        campaignReport,
        code: '1234PixTest',
        type: 'TEST-GIVEN',
      }));

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
      // then
      assert.dom('.campaign-details-header-report__info:nth-child(1) .campaign-details-content__text').hasText('1234PixTest');
      assert.dom('.campaign-details-header-report__info:nth-child(2) .campaign-details-content__text').hasText('10');
      assert.dom('.campaign-details-header-report__shared .campaign-details-content__text').hasText('4');
    });

    test('it should display - instead of 0 for the campaign report', async function(assert) {
      // given
      const campaignReport = run(() => store.createRecord('campaignReport', {
        id: 1,
        participationsCount: 0,
        sharedParticipationsCount: 0,
      }));
      const campaign = run(() => store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        campaignReport
      }));

      this.set('campaign', campaign);

      // when
      await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

      // then
      assert.dom('.campaign-details-header-report__info:nth-child(2) .campaign-details-content__text').hasText('-');
      assert.dom('.campaign-details-header-report__shared .campaign-details-content__text').hasText('-');
    });
  });

  module('Navigation', function() {
    test('it should display campaign details item', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {});

      this.set('campaign', campaign);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
      // then
      assert.dom('[aria-label="Détails de la campagne"]').hasText('Détails');
    });
    module('When campaign type is TEST_GIVEN', function() {
      test('it should display participation item', async function(assert) {
        // given
        const campaignReport = store.createRecord('campaignReport', {
          participationsCount: 1,
        });
        const campaign = store.createRecord('campaign', {
          campaignReport,
          type: 'TEST-GIVEN',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
        // then
        assert.dom('[aria-label="Participants"]').hasText('Participants (1)');
      });
      test('it should display collective results item', async function(assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'TEST-GIVEN',
        });

        this.set('campaign', campaign);

        // when
        await render(hbs`<Routes::Authenticated::Campaigns::DetailsItem @campaign={{campaign}}/>`);
        // then
        assert.dom('[aria-label="Résultats collectifs"]').hasText('Résultats collectifs');
      });
    });
  });
});
