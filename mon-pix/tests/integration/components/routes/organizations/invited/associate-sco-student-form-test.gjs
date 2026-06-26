import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AssociateScoStudentForm from 'mon-pix/components/routes/organizations/invited/associate-sco-student-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService, stubSessionService } from '../../../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/organizations/invited/associate-sco-student-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  const organizationId = 123;
  let store;
  let createdRecord;

  hooks.beforeEach(function () {
    stubSessionService(this.owner, { isAuthenticated: true });
    createdRecord = { unloadRecord: sinon.stub() };
    store = this.owner.lookup('service:store');
    store.createRecord = sinon.stub().returns(createdRecord);
  });

  async function fillAndSubmitForm(
    screen,
    { firstName = 'Robert', lastName = 'Smith', dayOfBirth = '10', monthOfBirth = '10', yearOfBirth = '2000' } = {},
  ) {
    await fillIn(screen.getByRole('textbox', { name: t('pages.join.fields.firstname.label') }), firstName);
    await fillIn(screen.getByRole('textbox', { name: t('pages.join.fields.lastname.label') }), lastName);
    await fillIn(screen.getByRole('spinbutton', { name: t('pages.join.fields.birthdate.day-label') }), dayOfBirth);
    await fillIn(screen.getByRole('spinbutton', { name: t('pages.join.fields.birthdate.month-label') }), monthOfBirth);
    await fillIn(screen.getByRole('spinbutton', { name: t('pages.join.fields.birthdate.year-label') }), yearOfBirth);
    await click(screen.getByRole('button', { name: t('pages.join.button') }));
  }

  module('#submit', function () {
    test('creates a sco-organization-learner and calls onSubmit without reconciliation', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
      const onSubmit = sinon.stub().resolves();

      // when
      const screen = await render(
        <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
      );
      await fillAndSubmitForm(screen);

      // then
      sinon.assert.calledWith(store.createRecord, 'sco-organization-learner', {
        id: `${organizationId}_Smith`,
        firstName: 'Robert',
        lastName: 'Smith',
        birthdate: '2000-10-10',
        organizationId,
      });
      sinon.assert.calledWith(onSubmit, createdRecord, { withReconciliation: false });
      sinon.assert.calledOnce(createdRecord.unloadRecord);
      assert.ok(true);
    });

    test('displays no error when submission succeeds', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
      const onSubmit = sinon.stub().resolves();

      // when
      const screen = await render(
        <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
      );
      await fillAndSubmitForm(screen);

      // then
      assert.notOk(screen.queryByText(t('pages.join.sco.error-not-found')));
      assert.notOk(screen.queryByText(t('api-error-messages.join-error.r70')));
    });

    module('When user is logged in with email', function () {
      test('opens the information modal showing the email as connection method', async function (assert) {
        // given
        const connectionMethod = 'robert@example.net';
        stubCurrentUserService(this.owner, { email: connectionMethod });
        const onSubmit = sinon.stub().resolves();

        // when
        const screen = await render(
          <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
        );
        await fillAndSubmitForm(screen);

        // then
        const modal = await screen.findByRole('dialog');
        assert.dom(modal).exists();
        assert.dom(modal).containsText(connectionMethod);
        assert.dom(modal).containsText('Robert');
        assert.dom(modal).containsText('Smith');
      });
    });

    module('When user is logged in with username', function () {
      test('opens the information modal showing the username as connection method', async function (assert) {
        // given
        const connectionMethod = 'john.doe3001';
        class CurrentUserStub extends Service {
          user = { username: connectionMethod };
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const onSubmit = sinon.stub().resolves();

        // when
        const screen = await render(
          <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
        );
        await fillAndSubmitForm(screen);

        // then
        const modal = await screen.findByRole('dialog');
        assert.dom(modal).containsText(connectionMethod);
        assert.dom(modal).containsText('Robert');
        assert.dom(modal).containsText('Smith');
      });
    });

    module('Errors', function () {
      test('displays a not found error', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
        const onSubmit = sinon.stub().rejects({ errors: [{ status: '404' }] });

        // when
        const screen = await render(
          <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
        );
        await fillAndSubmitForm(screen);

        // then
        sinon.assert.calledOnce(createdRecord.unloadRecord);
        assert.ok(screen.getByText(/Vérifiez vos informations/));
      });

      test('displays the invalid reconciliation error on a 400', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
        const onSubmit = sinon.stub().rejects({ errors: [{ status: '400' }] });

        // when
        const screen = await render(
          <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
        );
        await fillAndSubmitForm(screen);

        // then
        assert.ok(screen.getByText(/Veuillez contacter le support/));
      });

      module('When another student is already reconciled on the same organization (R70)', function () {
        test('displays the R70 conflict error message', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
          const onSubmit = sinon.stub().rejects({
            errors: [
              {
                status: '409',
                code: 'USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION',
                title: 'Conflict',
                meta: { shortCode: 'R70' },
              },
            ],
          });

          // when
          const screen = await render(
            <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
          );
          await fillAndSubmitForm(screen);

          // then
          assert.ok(screen.getByText(t('api-error-messages.join-error.r70')));
        });
      });

      module('When student is already reconciled', function () {
        test('opens the information modal and stores the userId for association', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
          const session = this.owner.lookup('service:session');
          const onSubmit = sinon
            .stub()
            .rejects({ errors: [{ status: '409', meta: { userId: 1, shortCode: 'R11', value: 'r@example.net' } }] });

          // when
          const screen = await render(
            <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
          );
          await fillAndSubmitForm(screen);

          // then
          assert.dom(await screen.findByRole('dialog')).exists();
          assert.strictEqual(session.userIdForLearnerAssociation, 1);
        });
      });

      module('When user is trying to reconcile on another account (422)', function () {
        test('opens the information modal informing the account belongs to another user', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
          const onSubmit = sinon
            .stub()
            .rejects({ errors: [{ status: '422', code: 'ACCOUNT_SEEMS_TO_BELONGS_TO_ANOTHER_USER' }] });

          // when
          const screen = await render(
            <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
          );
          await fillAndSubmitForm(screen);

          // then
          const modal = await screen.findByRole('dialog');
          assert.dom(modal).containsText(t('api-error-messages.join-error.r90.account-belonging-to-another-user'));
        });
      });
    });

    module('When student mistyped its information, has an error, and corrects it', function () {
      test('switches from the reconciliation error modal to the information modal allowing association', async function (assert) {
        // given
        const connectionMethod = 'robert.smith@example.net';
        stubCurrentUserService(this.owner, { email: connectionMethod });
        const onSubmit = sinon
          .stub()
          .onFirstCall()
          .rejects({ errors: [{ status: '409', meta: { userId: 1, shortCode: 'R11', value: 'r@example.net' } }] })
          .onSecondCall()
          .resolves();

        const screen = await render(
          <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
        );

        // when
        await fillAndSubmitForm(screen);
        // the first submit opens the modal in reconciliation-error mode (no associate button)
        await screen.findByRole('dialog');
        assert.notOk(screen.queryByRole('button', { name: t('pages.join.sco.associate') }));

        // the user closes the error modal before correcting the form
        await click(screen.getByRole('button', { name: 'Fermer' }));
        await fillAndSubmitForm(screen);

        // then
        const modal = await screen.findByRole('dialog');
        assert.dom(modal).containsText(connectionMethod);
        assert.ok(screen.getByRole('button', { name: t('pages.join.sco.associate') }));
      });
    });
  });

  module('#associate', function () {
    test('creates a sco-organization-learner, calls onSubmit with reconciliation and closes the modal', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { email: 'robert.smith@example.net' });
      const onSubmit = sinon.stub().resolves();

      const screen = await render(
        <template><AssociateScoStudentForm @onSubmit={{onSubmit}} @organizationId={{organizationId}} /></template>,
      );

      // open the information modal through a successful submit
      await fillAndSubmitForm(screen);
      await screen.findByRole('dialog');
      store.createRecord.resetHistory();

      // when
      await click(screen.getByRole('button', { name: t('pages.join.sco.associate') }));

      // then
      sinon.assert.calledWith(store.createRecord, 'sco-organization-learner', {
        id: `${organizationId}_Smith`,
        firstName: 'Robert',
        lastName: 'Smith',
        birthdate: '2000-10-10',
        organizationId,
      });
      sinon.assert.calledWith(onSubmit, createdRecord, { withReconciliation: true });
      assert.notOk(screen.queryByRole('dialog'));
    });
  });
});
