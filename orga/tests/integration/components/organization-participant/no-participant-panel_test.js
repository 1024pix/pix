import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationParticipant::NoParticipantPanel', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display the empty state with message, call to action and action for PRO', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'PRO' });
      isSCOManagingStudents = false;
      isSUPManagingStudents = false;
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    await render(hbs`<OrganizationParticipant::NoParticipantPanel />`);

    // then
    assert.contains(this.intl.t('pages.organization-participants.empty-state.message'));
    assert.contains(this.intl.t('pages.organization-participants.empty-state.call-to-action'));
    assert.contains(this.intl.t('pages.organization-participants.empty-state.action'));
  });

  test('it should only display the empty state message for SCO', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isSCOManagingStudents = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    await render(hbs`<OrganizationParticipant::NoParticipantPanel />`);
    // then
    assert.contains(this.intl.t('pages.organization-participants.empty-state.message'));
    assert.notContains(this.intl.t('pages.organization-participants.empty-state.call-to-action'));
    assert.notContains(this.intl.t('pages.organization-participants.empty-state.action'));
  });

  test('it should only display the empty state message for SUP', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SUP' });
      isSUPManagingStudents = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    await render(hbs`<OrganizationParticipant::NoParticipantPanel />`);
    // then
    assert.contains(this.intl.t('pages.organization-participants.empty-state.message'));
    assert.notContains(this.intl.t('pages.organization-participants.empty-state.call-to-action'));
    assert.notContains(this.intl.t('pages.organization-participants.empty-state.action'));
  });
});
