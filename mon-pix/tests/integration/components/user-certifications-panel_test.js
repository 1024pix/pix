import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | user certifications panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is no certifications', function () {
    test('should render a panel which indicate there is no certifications', async function (assert) {
      // given / when
      const screen = await render(hbs`<UserCertificationsPanel />`);

      // then
      assert.dom(screen.getByText("Vous n'avez pas encore de certification.")).exists();
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
      const screen = await render(hbs`<UserCertificationsPanel @certifications={{this.certifications}}/>`);

      // then
      assert.dom(screen.getByText('date')).exists();
      assert.dom(screen.getByText('statut')).exists();
      assert.dom(screen.getByText('score pix')).exists();
      assert.dom(screen.getByText('centre de certification')).exists();
      assert.dom(screen.getByText('Université de Paris')).exists();
      assert.dom(screen.getByText('Université de Lyon')).exists();
    });
  });
});
