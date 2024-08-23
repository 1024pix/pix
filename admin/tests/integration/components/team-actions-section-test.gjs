import { clickByName, fillByLabel } from '@1024pix/ember-testing-library';
import { render } from '@ember/test-helpers';
import TeamActionsSection from 'pix-admin/components/organizations/team-actions-section';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | organization-team-actions-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should call addOrganizationMembership method', async function (assert) {
    // given
    const addOrganizationMembershipStub = sinon.stub();
    const addOrganizationMembership = addOrganizationMembershipStub;
    const noop = () => {};

    // when
    await render(
      <template>
        <TeamActionsSection
          @addOrganizationMembership={{addOrganizationMembership}}
          @createOrganizationInvitation={{noop}}
          @triggerFiltering={{noop}}
          @onChangeUserEmailToAdd={{noop}}
        />
      </template>,
    );

    await fillByLabel('Ajouter un membre', 'user@example.net');
    await clickByName('Ajouter un membre');

    // then
    sinon.assert.called(addOrganizationMembershipStub);
    assert.ok(true);
  });
});
