import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Participant::Assessment::Tabs', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.setupRouter();
  });

  test('it should display navigation links for results and analysis pages', async function(assert) {
    // given
    this.campaignId = 1;
    this.participationId = 2;

    // when
    await render(hbs`<Participant::Assessment::Tabs @campaignId={{campaignId}} @participationId={{participationId}} />`);

    // then
    assert.dom('a[href="/campagnes/1/evaluations/2/resultats"]').hasText('Résultats');
    assert.dom('a[href="/campagnes/1/evaluations/2/analyse"]').hasText('Analyse');
  });
});
