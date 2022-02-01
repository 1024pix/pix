import sinon from 'sinon';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { clickByName } from '@1024pix/ember-testing-library';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::Header::ArchivedBanner', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('When campaign is active', () => {
    test('it should not display unarchive banner', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 1,
        isArchived: false,
      });

      // when
      await render(hbs`<Campaign::Header::ArchivedBanner @campaign={{campaign}}/>`);

      // then
      assert.notContains('Désarchiver la campagne');
    });
  });

  module('When campaign is archived', () => {
    test('it should display unarchive banner', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 1,
        isArchived: true,
      });

      // when
      await render(hbs`<Campaign::Header::ArchivedBanner @campaign={{campaign}}/>`);

      // then
      assert.contains('Désarchiver la campagne');
    });

    test('it should unarchive campaign on button click', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', {
        id: 1,
        isArchived: true,
        unarchive: sinon.stub(),
      });

      // when
      await render(hbs`<Campaign::Header::ArchivedBanner @campaign={{campaign}}/>`);
      await clickByName('Désarchiver la campagne');

      // then
      assert.ok(this.campaign.unarchive.calledOnce);
    });
  });
});
