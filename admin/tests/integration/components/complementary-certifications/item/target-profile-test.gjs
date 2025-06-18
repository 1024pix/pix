import { render } from '@1024pix/ember-testing-library';
import TargetProfile from 'pix-admin/components/complementary-certifications/item/target-profile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | complementary-certifications/item/target-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display target profile information', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const serviceRouter = this.owner.lookup('service:router');
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
    const complementaryCertification = store.createRecord('complementary-certification', {
      id: 10,
      key: 'DROIT',
      label: 'Pix+Droit',
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

    sinon
      .stub(serviceRouter, 'currentRoute')
      .value({ parent: { params: { complementary_certification_id: complementaryCertification.id } } });

    // when
    const screen = await render(<template><TargetProfile /></template>);

    // then
    assert.dom(screen.getByText('Rattacher un nouveau profil cible')).exists();
    assert
      .dom(
        screen.getByRole('heading', {
          name: t('components.complementary-certifications.target-profiles.badges-list.title'),
        }),
      )
      .exists();
    assert.dom(screen.getByText('Badge Cascade')).exists();
    assert.dom(screen.getByText('Badge Volcan')).exists();

    assert
      .dom(
        screen.getByRole('heading', {
          name: t('components.complementary-certifications.target-profiles.history-list.title'),
        }),
      )
      .exists();
  });
});
