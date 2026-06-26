import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AssociateScoStudentWithMediacentreForm from 'mon-pix/components/routes/organizations/join/associate-sco-student-with-mediacentre-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

const EXTERNAL_USER_TOKEN =
  'aaa.' +
  btoa(
    '{"first_name":"JeanPrescrit","last_name":"Campagne","saml_id":"SamlId","source":"external","iat":1545321469,"exp":4702193958}',
  ) +
  '.bbb';

module(
  'Integration | Component | routes/organizations/join/associate-sco-student-with-mediacentre-form',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let sessionService;
    let createRecordStub;
    let unloadRecordStub;

    hooks.beforeEach(function () {
      unloadRecordStub = sinon.stub();

      class SessionStub extends Service {
        externalUserTokenFromGar = EXTERNAL_USER_TOKEN;
        userIdForLearnerAssociation = null;
      }
      this.owner.register('service:session', SessionStub);
      sessionService = this.owner.lookup('service:session');

      const externalUserRecord = { unloadRecord: unloadRecordStub };
      createRecordStub = sinon.stub().returns(externalUserRecord);
      class StoreStub extends Service {
        createRecord = createRecordStub;
      }
      this.owner.register('service:store', StoreStub);
    });

    async function fillAndSubmit(screen) {
      await fillIn(screen.getByRole('spinbutton', { name: t('pages.join.fields.birthdate.day-label') }), '10');
      await fillIn(screen.getByRole('spinbutton', { name: t('pages.join.fields.birthdate.month-label') }), '10');
      await fillIn(screen.getByRole('spinbutton', { name: t('pages.join.fields.birthdate.year-label') }), '2000');
      await click(screen.getByRole('button', { name: t('pages.join.button') }));
    }

    test('should create an external-user and call onSubmit with it', async function (assert) {
      // given
      const onSubmitStub = sinon.stub().resolves();
      const externalUserRecord = { unloadRecord: unloadRecordStub };
      createRecordStub.returns(externalUserRecord);

      const screen = await render(
        <template>
          <AssociateScoStudentWithMediacentreForm @onSubmit={{onSubmitStub}} @organizationId={{123}} />
        </template>,
      );

      // when
      await fillAndSubmit(screen);

      // then
      sinon.assert.calledWith(createRecordStub, 'external-user', {
        birthdate: '2000-10-10',
        organizationId: 123,
        externalUserToken: EXTERNAL_USER_TOKEN,
      });
      sinon.assert.calledWith(onSubmitStub, externalUserRecord);
      assert.ok(true);
    });

    test('should not display any error when submit succeeds', async function (assert) {
      // given
      const onSubmitStub = sinon.stub().resolves();
      const screen = await render(
        <template>
          <AssociateScoStudentWithMediacentreForm @onSubmit={{onSubmitStub}} @organizationId={{123}} />
        </template>,
      );

      // when
      await fillAndSubmit(screen);

      // then
      assert.dom(screen.queryByText(t('pages.join.sco.error-not-found'))).doesNotExist();
      assert.dom(screen.queryByRole('dialog')).doesNotExist();
    });

    module('Errors', function () {
      test('should display a not found error and unload the record', async function (assert) {
        // given
        const onSubmitStub = sinon.stub().rejects({ errors: [{ status: '404' }] });

        const screen = await render(
          <template>
            <AssociateScoStudentWithMediacentreForm @onSubmit={{onSubmitStub}} @organizationId={{123}} />
          </template>,
        );

        // when
        await fillAndSubmit(screen);

        // then
        sinon.assert.calledOnce(unloadRecordStub);
        assert
          .dom(
            screen.getByText((content) =>
              content.includes('Vérifiez vos informations (prénom, nom et date de naissance)'),
            ),
          )
          .exists();
      });

      test('should display the invalid reconciliation error when receiving a 400', async function (assert) {
        // given
        const onSubmitStub = sinon.stub().rejects({ errors: [{ status: '400' }] });

        const screen = await render(
          <template>
            <AssociateScoStudentWithMediacentreForm @onSubmit={{onSubmitStub}} @organizationId={{123}} />
          </template>,
        );

        // when
        await fillAndSubmit(screen);

        // then
        assert.dom(screen.getByText((content) => content.includes('Veuillez contacter le support'))).exists();
      });

      module('When another student is already reconciled on the same organization', function () {
        test('should display the R70 error message', async function (assert) {
          // given
          const onSubmitStub = sinon.stub().rejects({
            errors: [
              {
                status: '409',
                code: 'USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION',
                title: 'Conflict',
                detail: 'Une erreur est survenue. Déconnectez-vous et recommencez.',
                meta: { shortCode: 'R70' },
              },
            ],
          });

          const screen = await render(
            <template>
              <AssociateScoStudentWithMediacentreForm @onSubmit={{onSubmitStub}} @organizationId={{123}} />
            </template>,
          );

          // when
          await fillAndSubmit(screen);

          // then
          assert.dom(screen.getByText(t('api-error-messages.join-error.r70'))).exists();
        });
      });

      module('When student is already reconciled', function () {
        test('should open information modal and store the user id for learner association', async function (assert) {
          // given
          const onSubmitStub = sinon
            .stub()
            .rejects({ errors: [{ status: '409', meta: { shortCode: 'R11', value: 'j***@example.net', userId: 1 } }] });

          const screen = await render(
            <template>
              <AssociateScoStudentWithMediacentreForm @onSubmit={{onSubmitStub}} @organizationId={{123}} />
            </template>,
          );

          // when
          await fillAndSubmit(screen);

          // then
          sinon.assert.calledOnce(unloadRecordStub);
          assert.dom(screen.getByText(t('pages.join.sco.login-information-title'))).exists();
          assert.strictEqual(sessionService.userIdForLearnerAssociation, 1);
        });
      });

      module('When student mistyped its information, has an error, and corrects it', function () {
        test('should no longer display the information modal after a successful retry', async function (assert) {
          // given
          const onSubmitStub = sinon.stub();
          onSubmitStub
            .onFirstCall()
            .rejects({ errors: [{ status: '409', meta: { shortCode: 'R11', value: 'j***@example.net', userId: 1 } }] })
            .onSecondCall()
            .resolves();

          const screen = await render(
            <template>
              <AssociateScoStudentWithMediacentreForm @onSubmit={{onSubmitStub}} @organizationId={{123}} />
            </template>,
          );

          // when
          await fillAndSubmit(screen);
          await fillAndSubmit(screen);

          // then
          assert.dom(screen.queryByText(t('pages.join.sco.login-information-title'))).doesNotExist();
        });
      });
    });
  },
);
