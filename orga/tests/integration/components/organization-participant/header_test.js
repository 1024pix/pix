import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | OrganizationParticipant::header', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display the header labels', async function (assert) {
    // given
    this.set('participantCount', 5);

    // when
    await render(hbs`<OrganizationParticipant::Header @participantCount={{participantCount}}/>`);

    // then
    assert.contains(this.intl.t('pages.organization-participants.title', { count: 5 }));
  });
});
