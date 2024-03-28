import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | SupOrganizationParticipant::ImportCards::Add', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('upload button', () => {
    test('should be disable', async function (assert) {
      // when
      const screen = await render(hbs`<SupOrganizationParticipant::ImportCards::Add @disabled={{true}} />`);

      // then
      const button = screen.getByRole('button', {
        name: this.intl.t('pages.organization-participants-import.actions.add-sup.label'),
      });
      assert.ok(button.hasAttribute('disabled'));
    });

    test('should be enable', async function (assert) {
      // when
      const screen = await render(hbs`<SupOrganizationParticipant::ImportCards::Add @disabled={{false}} />`);

      // then
      const button = screen.getByRole('button', {
        name: this.intl.t('pages.organization-participants-import.actions.add-sup.label'),
      });
      assert.notOk(button.hasAttribute('disabled'));
    });
  });
});
