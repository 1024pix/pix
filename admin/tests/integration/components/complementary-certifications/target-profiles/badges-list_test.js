import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::BadgesList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test("it should display complementary certification's badges list", async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const complementaryCertification = store.createRecord('complementary-certification', {
      label: 'MARIANNE CERTIF',
      targetProfilesHistory: [
        {
          detachedAt: null,
          name: 'ALEX TARGET',
          id: 3,
          badges: [
            { id: 1023, label: 'Badge Cascade', level: 3 },
            { id: 1025, label: 'Badge Volcan', level: 1 },
          ],
        },
      ],
    });
    this.currentTargetProfile = complementaryCertification.currentTargetProfiles[0];

    // when
    const screen = await render(
      hbs`<ComplementaryCertifications::TargetProfiles::BadgesList @currentTargetProfile={{this.currentTargetProfile}} />`,
    );

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'ID' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Nom du résultat thématique' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Niveau' })).exists();
    assert.dom(screen.getByRole('row', { name: '1023 Badge Cascade 3' })).exists();
    assert.dom(screen.getByRole('row', { name: '1025 Badge Volcan 1' })).exists();
  });
});
