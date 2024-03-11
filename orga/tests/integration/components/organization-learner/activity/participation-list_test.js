import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationLearner::Activity::ParticipationList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participations details of Assessment', async function (assert) {
    this.set('participations', [
      {
        campaignType: 'ASSESSMENT',
        campaignName: 'Ma 1ère campagne',
        createdAt: '2022-12-12',
        sharedAt: '2022-12-25',
        status: 'SHARED',
        participationCount: '2',
      },
    ]);

    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationList @participations={{this.participations}} />`,
    );

    assert.ok(screen.getByText('Ma 1ère campagne'));
    assert.ok(screen.getByText('Évaluation'));
    assert.ok(screen.getByText('12/12/2022'));
    assert.ok(screen.getByText('25/12/2022'));
    assert.ok(screen.getByText('Résultats reçus'));
    assert.ok(screen.getByText('2'));
  });

  test('it should display participations details of Profiles collection', async function (assert) {
    this.set('participations', [
      {
        campaignType: 'PROFILES_COLLECTION',
        campaignName: 'Ma 1ère campagne',
        createdAt: '2022-12-12',
        sharedAt: '2022-12-25',
        status: 'SHARED',
        participationCount: '1',
      },
    ]);

    const screen = await render(
      hbs`<OrganizationLearner::Activity::ParticipationList @participations={{this.participations}} />`,
    );

    assert.ok(screen.getByText('Ma 1ère campagne'));
    assert.ok(screen.getByText('Collecte de profil'));
    assert.ok(screen.getByText('12/12/2022'));
    assert.ok(screen.getByText('25/12/2022'));
    assert.ok(screen.getByText('Profil reçu'));
    assert.ok(screen.getByText('1'));
  });
});
