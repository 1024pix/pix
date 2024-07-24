import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import TableRow from 'pix-orga/components/organization-participant/table-row';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | OrganizationParticipant | TableRow', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('common cases', function () {
    test('should display common column', async function (assert) {
      const noop = sinon.stub();
      const participant = {
        firstName: 'Jean',
        lastName: 'Bon',
        participationCount: 1,
      };

      // when
      const screen = await render(
        <template>
          <TableRow
            @showCheckbox={{noop}}
            @participant={{participant}}
            @isParticipantSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleParticipant={{noop}}
            @onClickLearner={{noop}}
            @hideCertifiableDate={{true}}
          />
        </template>,
      );

      // then
      assert.ok(screen.queryByText('Jean'));
      assert.ok(screen.queryByText('Bon'));
      assert.ok(screen.queryByText(1));
    });

    test('should have a link on participant lastname to redirect on his page', async function (assert) {
      const noop = sinon.stub();
      const participant = {
        id: 777,
        firstName: 'Jean',
        lastName: 'Bon',
        participationCount: 1,
      };

      // when
      const screen = await render(
        <template>
          <TableRow
            @showCheckbox={{noop}}
            @participant={{participant}}
            @isParticipantSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleParticipant={{noop}}
            @onClickLearner={{noop}}
            @hideCertifiableDate={{true}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('link', { name: 'Bon' })).hasAttribute('href', '/participants/777');
    });
  });

  module('selection cases', function () {
    test('hide checkbox when selection is disabled', async function (assert) {
      const noop = sinon.stub();
      const participant = {
        firstName: 'Jean',
        lastName: 'Bon',
        participationCount: 1,
      };

      // when
      const screen = await render(
        <template>
          <TableRow
            @showCheckbox={{false}}
            @participant={{participant}}
            @isParticipantSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleParticipant={{noop}}
            @onClickLearner={{noop}}
            @hideCertifiableDate={{true}}
          />
        </template>,
      );

      // then
      assert.notOk(
        screen.queryByRole('checkbox', {
          name: t('pages.organization-participants.table.column.checkbox', {
            firstname: participant.firstName,
            lastname: participant.lastName,
          }),
        }),
      );
    });

    test('show checkbox when selection is enabled', async function (assert) {
      const noop = sinon.stub();
      const participant = {
        firstName: 'Jean',
        lastName: 'Bon',
        participationCount: 1,
      };

      // when
      const screen = await render(
        <template>
          <TableRow
            @showCheckbox={{true}}
            @participant={{participant}}
            @isParticipantSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleParticipant={{noop}}
            @onClickLearner={{noop}}
            @hideCertifiableDate={{true}}
          />
        </template>,
      );

      // then
      assert.ok(
        screen.getByRole('checkbox', {
          name: t('pages.organization-participants.table.column.checkbox', {
            firstname: participant.firstName,
            lastname: participant.lastName,
          }),
        }),
      );
    });
  });

  module('certificability cases', function () {
    module('when hideCertifiableDate is true', function () {
      test('it should not display certifiableAt date', async function (assert) {
        // given
        const certifiableDate = '10/10/2023';
        const noop = sinon.stub();
        const participant = {
          firstName: 'Jean',
          lastName: 'Bon',
          participationCount: 1,
          isCertifiable: true,
          certifiableAt: new Date(certifiableDate),
        };

        const hideCertifiableDate = true;

        // when
        const screen = await render(
          <template>
            <TableRow
              @showCheckbox={{noop}}
              @participant={{participant}}
              @isParticipantSelected={{noop}}
              @openAuthenticationMethodModal={{noop}}
              @onToggleParticipant={{noop}}
              @onClickLearner={{noop}}
              @hideCertifiableDate={{hideCertifiableDate}}
            />
          </template>,
        );

        // then
        assert.notOk(screen.queryByText(certifiableDate));
      });
    });

    module('when hideCertifiableDate is false', function () {
      test('it display certifiableAt date', async function (assert) {
        // given
        const certifiableDate = '10/10/2023';
        const noop = sinon.stub();
        const participant = {
          firstName: 'Jean',
          lastName: 'Bon',
          participationCount: 1,
          isCertifiable: true,
          certifiableAt: new Date(certifiableDate),
        };
        const hideCertifiableDate = false;

        // when
        const screen = await render(
          <template>
            <TableRow
              @showCheckbox={{noop}}
              @participant={{participant}}
              @isParticipantSelected={{noop}}
              @openAuthenticationMethodModal={{noop}}
              @onToggleParticipant={{noop}}
              @onClickLearner={{noop}}
              @hideCertifiableDate={{hideCertifiableDate}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByText(certifiableDate));
      });
    });
  });

  module('extra columns cases', function () {
    test('should not display extra column when not defined', async function (assert) {
      const noop = sinon.stub();
      const participant = {
        firstName: 'Jean',
        lastName: 'Bon',
        participationCount: 1,
        extraColumns: {
          'awesome.key': 'awesome value',
        },
      };

      // when
      const screen = await render(
        <template>
          <TableRow
            @showCheckbox={{noop}}
            @participant={{participant}}
            @isParticipantSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleParticipant={{noop}}
            @customRows={{null}}
            @onClickLearner={{noop}}
            @hideCertifiableDate={{true}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByText('awesome value'));
    });

    test('should display extra column when defined', async function (assert) {
      const noop = sinon.stub();
      const customRows = ['awesome.key'];
      const participant = {
        firstName: 'Jean',
        lastName: 'Bon',
        participationCount: 1,
        extraColumns: {
          'awesome.key': 'awesome value',
        },
      };

      // when
      const screen = await render(
        <template>
          <TableRow
            @showCheckbox={{noop}}
            @participant={{participant}}
            @isParticipantSelected={{noop}}
            @openAuthenticationMethodModal={{noop}}
            @onToggleParticipant={{noop}}
            @customRows={{customRows}}
            @onClickLearner={{noop}}
            @hideCertifiableDate={{true}}
          />
        </template>,
      );

      // then
      assert.ok(screen.queryByText('awesome value'));
    });
  });
});
