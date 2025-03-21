import { render, within } from '@1024pix/ember-testing-library';
import BadgesList from 'pix-admin/components/complementary-certifications/target-profiles/badges-list';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

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
    const currentTargetProfile = complementaryCertification.currentTargetProfiles[0];

    // when
    const screen = await render(<template><BadgesList @currentTargetProfile={{currentTargetProfile}} /></template>);

    // then
    const table = screen.getByRole('table', {
      name: t('components.complementary-certifications.target-profiles.badges-list.caption'),
    });
    assert.dom(within(table).getByRole('columnheader', { name: 'Image du badge certifié' })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'Nom du badge certifié' })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'Niveau du badge certifié' })).exists();
    assert.dom(within(table).getByRole('columnheader', { name: 'ID du badge certifiant' })).exists();
    assert.dom(within(table).getByRole('row', { name: 'Badge Cascade Badge Cascade 3 1023' })).exists();
    assert.dom(within(table).getByRole('row', { name: 'Badge Volcan Badge Volcan 1 1025' })).exists();
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
    const currentTargetProfile = complementaryCertification.currentTargetProfiles[0];

    // when
    const screen = await render(<template><BadgesList @currentTargetProfile={{currentTargetProfile}} /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: '75' })).hasAttribute('href', '/target-profiles/85/badges/75');
  });
});
