import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Assessment::Tabs', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.setupRouter();
  });

  test('it should display navigation links for results and analysis pages', async function (assert) {
    // given
    this.campaignId = 1;
    this.participationId = 2;

    // when
    const screen = await renderScreen(
      hbs`<Participant::Assessment::Tabs @campaignId={{this.campaignId}} @participationId={{this.participationId}} />`,
    );

    // then
    assert.dom(screen.getByText('Résultats')).exists();
    assert.dom(screen.getByText('Analyse')).exists();
  });

  test('[A11Y] it should contain accessibility aria-label nav', async function (assert) {
    // given
    this.campaignId = 1;
    this.participationId = 2;

    // when
    const screen = await renderScreen(
      hbs`<Participant::Assessment::Tabs @campaignId={{this.campaignId}} @participationId={{this.participationId}} />`,
    );

    // then
    assert.dom(screen.getByLabelText("Navigation de la section résultat d'une évaluation individuelle")).exists();
  });
});
