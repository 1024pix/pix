import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | user certifications panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<UserCertificationsPanel />`);
    assert.dom('.user-certifications-panel').exists();
  });

  module('when there is no certifications', function () {
    test('should render a panel which indicate there is no certifications', async function (assert) {
      // when
      await render(hbs`<UserCertificationsPanel />`);

      // then
      assert.dom('.user-certifications-panel__no-certification-panel').exists();
    });
  });

  module('when there is some certifications to show', function () {
    test('should render a certifications list', async function (assert) {
      // given
      const certification1 = EmberObject.create({
        id: 1,
        date: '2018-02-15T15:15:52.504Z',
        status: 'completed',
        certificationCenter: 'Université de Paris',
      });
      const certification2 = EmberObject.create({
        id: 2,
        date: '2018-02-15T15:15:52.504Z',
        status: 'completed',
        certificationCenter: 'Université de Lyon',
      });
      const certifications = [certification1, certification2];
      this.set('certifications', certifications);

      // when
      await render(hbs`<UserCertificationsPanel @certifications={{this.certifications}}/>`);

      // then
      assert.dom('.user-certifications-panel__certifications-list').exists();
    });
  });
});
