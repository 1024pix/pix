import { module, test } from 'qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Training | Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders component', async function (assert) {
    // given
    this.set('training', {
      title: 'Mon super training',
      link: 'https://training.net/',
      type: 'webinaire',
      locale: 'fr-fr',
      duration: { hours: 6 },
    });

    // when
    await render(hbs`<Training::Card @training={{this.training}} />`);

    // then
    assert.dom('.training-card').exists();
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.training-card__content').href, 'https://training.net/');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.training-card-content__title').textContent.trim(), 'Mon super training');
    assert.dom('.training-card-content__infos').exists();
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.training-card-content-infos-list__type').textContent.trim(), 'Webinaire');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(find('.training-card-content-infos-list__duration').textContent.trim(), '6h');
    assert.notOk(find('.training-card-content-illustration__image').alt);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(
      find('.training-card-content-illustration__logo').alt,
      this.intl.t('common.french-education-ministry')
    );
  });
});
