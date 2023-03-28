import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | certifications list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<CertificationsList />`);
    assert.dom('.certifications-list__table').exists();
  });

  module('when there is some completed certifications', function () {
    const certification1 = EmberObject.create({
      id: 1,
      date: '2018-02-15T15:15:52.504Z',
      status: 'validated',
      certificationCenter: 'Université de Paris',
      isPublished: true,
      pixScore: 231,
    });
    const certification2 = EmberObject.create({
      id: 2,
      date: '2018-02-15T15:15:52.504Z',
      status: 'rejected',
      certificationCenter: 'Université de Lyon',
      isPublished: true,
      pixScore: 231,
    });

    test('should render two certification items when there is 2 completed certifications', async function (assert) {
      const completedCertifications = [certification1, certification2];
      this.set('certifications', completedCertifications);

      // when
      await render(hbs`<CertificationsList @certifications={{this.certifications}}/>`);

      // then
      assert.strictEqual(findAll('.certifications-list__table-body .certifications-list-item').length, 2);
    });
  });
});
