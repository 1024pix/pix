import { render, within } from '@1024pix/ember-testing-library';
import Header from 'pix-admin/components/complementary-certifications/item/header';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | complementary-certifications/item/header', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display complementary certification information', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const complementaryCertification = store.createRecord('complementary-certification', {
      id: 0,
      key: 'DROIT',
      label: 'Pix+Droit',
    });

    // when
    const screen = await render(
      <template><Header @complementaryCertificationLabel={{complementaryCertification.label}} /></template>,
    );

    // then
    assert.ok(screen.getByRole('heading', { name: 'Certification complémentaire Pix+Droit', level: 1 }));
    const nav = screen.getByRole('navigation');
    assert.ok(within(nav).getByRole('link', { name: 'Toutes les certifications complémentaires' }));
  });
});
