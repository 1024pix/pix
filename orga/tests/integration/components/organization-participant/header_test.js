import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | OrganizationParticipant::header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Title', () => {
    test('it should show only title when participant count = 0', async function (assert) {
      //given
      this.set('participantCount', 0);

      // when
      const screen = await renderScreen(
        hbs`<OrganizationParticipant::Header @participantCount={{this.participantCount}} />`
      );

      // then
      assert.dom(screen.getByText(this.intl.t('pages.organization-participants.title', { count: 0 }))).exists();
    });

    test('it should show title with participant count when count > 0', async function (assert) {
      //given
      this.set('participantCount', 5);

      // when
      const screen = await renderScreen(
        hbs`<OrganizationParticipant::Header @participantCount={{this.participantCount}} />`
      );

      // then
      assert.dom(screen.getByText(this.intl.t('pages.organization-participants.title', { count: 5 }))).exists();
    });
  });
});
