import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | complementary-certifications/target-profiles/badges-list', function (hooks) {
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
            { id: 1023, label: 'Badge Cascade', level: 3, imageUrl: 'http://badge-cascade.net' },
            { id: 1025, label: 'Badge Volcan', level: 1, imageUrl: 'http://badge-volcan.net' },
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
    assert.dom(screen.getByRole('columnheader', { name: 'Image du badge certifié' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Nom du badge certifié' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Niveau du badge certifié' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'ID du RT certifiant' })).exists();
    assert.dom(screen.getByRole('row', { name: 'Badge Cascade Badge Cascade 3 1023' })).exists();
    assert.dom(screen.getByRole('row', { name: 'Badge Volcan Badge Volcan 1 1025' })).exists();
  });

  test('it should contain a link for each target profile badge', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const complementaryCertification = store.createRecord('complementary-certification', {
      label: 'CERTIF',
      targetProfilesHistory: [
        {
          detachedAt: null,
          name: 'TARGET PROFILE',
          id: 85,
          badges: [{ id: 75, label: 'Badge Feu', level: 3 }],
        },
      ],
    });
    this.currentTargetProfile = complementaryCertification.currentTargetProfiles[0];

    // when
    const screen = await render(
      hbs`<ComplementaryCertifications::TargetProfiles::BadgesList @currentTargetProfile={{this.currentTargetProfile}} />`,
    );

    // then
    assert.dom(screen.getByRole('link', { name: '75' })).hasAttribute('href', '/target-profiles/85/badges/75');
  });
});
