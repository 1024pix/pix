import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ScoOrganizationParticipantTableRow from 'pix-orga/components/sco-organization-participant/table-row';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::TableRow', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when isCertifiable is null', function () {
    test('it should not display certifiableAt date', async function (assert) {
      // given
      const certifiableDate = '10/10/2023';
      const noop = sinon.stub();
      const student = {
        firstName: 'Jean',
        lastName: 'Bon',
        birthdate: '2020/01/01',
        division: '3A',
        authenticationMethods: [],
        participationCount: 1,
        isCertifiable: null,
        certifiableAt: null,
      };

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantTableRow
            @showCheckbox={{noop}}
            @student={{student}}
            @isStudentSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleStudent={{noop}}
            @onClickLearner={{noop}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByText(certifiableDate)).doesNotExist();
      assert
        .dom(screen.queryByText(t('pages.sco-organization-participants.table.column.is-certifiable.not-available')))
        .exists();
    });
  });

  module('when isCertifiable is false', function () {
    test('it should display certifiableAt date', async function (assert) {
      // given
      const certifiableDate = '10/10/2023';
      const noop = sinon.stub();
      const student = {
        firstName: 'Jean',
        lastName: 'Bon',
        birthdate: '2020/01/01',
        division: '3A',
        authenticationMethods: [],
        participationCount: 1,
        isCertifiable: false,
        certifiableAt: new Date(certifiableDate),
      };

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantTableRow
            @showCheckbox={{noop}}
            @student={{student}}
            @isStudentSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleStudent={{noop}}
            @onClickLearner={{noop}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText(certifiableDate)).exists();
      assert
        .dom(screen.getByText(t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible')))
        .exists();
    });
  });

  module('when isCertifiable is true', function () {
    test('it should display certifiableAt date', async function (assert) {
      // given
      const certifiableDate = '10/10/2023';
      const noop = sinon.stub();
      const student = {
        firstName: 'Jean',
        lastName: 'Bon',
        birthdate: '2020/01/01',
        division: '3A',
        authenticationMethods: [],
        participationCount: 1,
        isCertifiable: true,
        certifiableAt: new Date(certifiableDate),
      };

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantTableRow
            @showCheckbox={{noop}}
            @student={{student}}
            @isStudentSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleStudent={{noop}}
            @onClickLearner={{noop}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText(certifiableDate)).exists();
      assert
        .dom(screen.getByText(t('pages.sco-organization-participants.table.column.is-certifiable.eligible')))
        .exists();
    });
  });

  module('when student is temporarily blocked', function () {
    test('it displays a temporarily blocked label', async function (assert) {
      // given
      const noop = sinon.stub();
      const student = {
        isTemporarilyBlocked: true,
      };

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantTableRow
            @showCheckbox={{noop}}
            @student={{student}}
            @isStudentSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleStudent={{noop}}
            @onClickLearner={{noop}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByText(t('pages.sco-organization-participants.user-account-blocking-types.temporarily-blocked')))
        .exists();
    });
  });

  module('when student is blocked', function () {
    test('it displays a blocked label', async function (assert) {
      // given
      const noop = sinon.stub();
      const student = {
        isBlocked: true,
      };

      // when
      const screen = await render(
        <template>
          <ScoOrganizationParticipantTableRow
            @showCheckbox={{noop}}
            @student={{student}}
            @isStudentSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleStudent={{noop}}
            @onClickLearner={{noop}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByText(t('pages.sco-organization-participants.user-account-blocking-types.blocked')))
        .exists();
    });
  });
});
