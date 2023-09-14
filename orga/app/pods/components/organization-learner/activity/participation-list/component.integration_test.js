import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../../../helpers/tests/setup-intl-rendering';

module('Integration | Component | OrganizationLearner::Activity::ParticipationList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participations details', async function (assert) {
    this.set('participations', [
      {
        campaignType: 'ASSESSMENT',
        campaignName: 'Ma 1ère campagne',
        createdAt: '2022-12-12',
        sharedAt: '2022-12-25',
        status: 'SHARED',
      },
    ]);

    await render(hbs`<OrganizationLearner::Activity::ParticipationList @participations={{this.participations}} />`);

    assert.contains('Ma 1ère campagne');
    assert.contains('Evaluation');
    assert.contains('12/12/2022');
    assert.contains('25/12/2022');
    assert.contains('Résultats reçus');
  });
});
