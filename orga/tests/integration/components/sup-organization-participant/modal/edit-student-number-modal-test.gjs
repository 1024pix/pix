import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { getDefaultNormalizer } from '@testing-library/dom';
import SupOrganizationParticipantModalEditStudentNumberModal from 'pix-orga/components/sup-organization-participant/modal/edit-student-number-modal';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | SupOrganizationParticipant::Modal::EditStudentNumberModal', function (hooks) {
  setupIntlRenderingTest(hooks);

  const stubs = {};
  const student = EmberObject.create({
    id: '123',
    firstName: 'Lyanna',
    lastName: 'Mormont',
    studentNumber: '1234',
  });

  hooks.beforeEach(function () {
    stubs.onSaveStudentNumberStub = sinon.stub();
    stubs.closeStub = sinon.stub();
    const notifications = this.owner.lookup('service:notifications');
    stubs.sendSuccess = sinon.stub(notifications, 'sendSuccess');
  });

  module('when the edit student number modal is open', function () {
    module('when there is student number', function () {
      test('should render component with student number text', async function (assert) {
        const screen = await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );

        assert.ok(
          screen.getByText(
            t('pages.sup-organization-participants.edit-student-number-modal.form.student-number', {
              firstName: student.firstName,
              lastName: student.lastName,
            }),
            // WARNING : nous avons ici un problème de rupture de la séparation des responsabilité
            // ce pourquoi nous sommes obligés de renseigner `normalizer: getDefaultNormalizer({ trim: false })z.
            // TODO :gérer les espaces en fin de texte avec du css et non dans les clés de traduction
            { exact: false, normalizer: getDefaultNormalizer({ trim: false }) },
          ),
        );
        assert.ok(screen.getByText(student.studentNumber));
      });
    });

    module('when there is no student number yet', function () {
      test('should not render component with student number text', async function (assert) {
        student.set('studentNumber', null);
        const screen = await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );

        assert.notOk(
          screen.queryByText(
            t('pages.sup-organization-participants.edit-student-number-modal.form.student-number', {
              firstName: student.firstName,
              lastName: student.lastName,
            }),
            // WARNING : nous avons ici un problème de rupture de la séparation des responsabilité
            // ce pourquoi nous sommes obligés de renseigner `normalizer: getDefaultNormalizer({ trim: false })z.
            // TODO :gérer les espaces en fin de texte avec du css et non dans les clés de traduction
            { exact: false, normalizer: getDefaultNormalizer({ trim: false }) },
          ),
        );
      });
    });

    module('When a student number is entered', function () {
      test('should have the update button enable', async function (assert) {
        const screen = await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );

        // when
        await fillByLabel(
          t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          '1234',
        );

        const submitButton = screen.getByText(
          t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        // then
        assert.dom(submitButton).doesNotHaveAttribute('aria-disabled');
      });
    });

    module('when a student number is not entered yet', function () {
      test('should have the update button disable', async function (assert) {
        const screen = await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );

        // when
        await fillByLabel(
          t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          'toto',
        );
        await clickByName(t('pages.sup-organization-participants.edit-student-number-modal.actions.update'));

        // then
        const submitButton = screen.getByText(
          t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        assert.ok(submitButton.hasAttribute('aria-disabled'));
      });
    });

    module('when the update button is clicked and a good student number is entered', function () {
      test('it display success notification', async function (assert) {
        await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );
        // given
        stubs.onSaveStudentNumberStub.withArgs(123456).resolves();

        // when
        await fillByLabel(
          t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          '123456',
        );
        await clickByName(t('pages.sup-organization-participants.edit-student-number-modal.actions.update'));

        // then
        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(stubs.closeStub);
        assert.ok(
          stubs.sendSuccess.calledWith(
            t('pages.sup-organization-participants.edit-student-number-modal.form.success', {
              firstName: student.firstName,
              lastName: student.lastName,
            }),
          ),
        );
      });
    });

    module('when the update button is clicked and a wrong student number is entered', function () {
      test('it display error message', async function (assert) {
        const screen = await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );

        // when
        await fillByLabel(
          t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          ' ',
        );
        await clickByName(t('pages.sup-organization-participants.edit-student-number-modal.actions.update'));

        // then
        assert.ok(screen.getByText(t('pages.sup-organization-participants.edit-student-number-modal.form.error')));
      });
    });

    module(
      'when the update button is clicked with the student number and this student number already exist',
      function () {
        test('it display an error under student number input', async function (assert) {
          // given
          const screen = await render(
            <template>
              <SupOrganizationParticipantModalEditStudentNumberModal
                @display={{true}}
                @onClose={{stubs.closeStub}}
                @student={{student}}
                @onSubmit={{stubs.onSaveStudentNumberStub}}
              />
            </template>,
          );

          const error = {
            errors: [
              {
                status: '412',
                detail: 'STUDENT_NUMBER_EXISTS',
              },
            ],
          };
          stubs.onSaveStudentNumberStub.rejects(error);

          // when
          await fillByLabel(
            t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
            '77107',
          );
          await clickByName(t('pages.sup-organization-participants.edit-student-number-modal.actions.update'));

          // then
          assert.ok(
            screen.getByText(
              t('api-error-messages.edit-student-number.student-number-exists', {
                firstName: student.firstName,
                lastName: student.lastName,
              }),
            ),
          );
        });

        test('it remove errors when submitting is a success', async function (assert) {
          // given
          const screen = await render(
            <template>
              <SupOrganizationParticipantModalEditStudentNumberModal
                @display={{true}}
                @onClose={{stubs.closeStub}}
                @student={{student}}
                @onSubmit={{stubs.onSaveStudentNumberStub}}
              />
            </template>,
          );

          const error = {
            errors: [
              {
                status: '412',
                detail: 'STUDENT_NUMBER_EXISTS',
              },
            ],
          };
          stubs.onSaveStudentNumberStub.onFirstCall().rejects(error).onSecondCall().resolves();

          // when
          await fillByLabel('Nouveau numéro étudiant', '77107');
          await clickByName('Mettre à jour');
          await fillByLabel('Nouveau numéro étudiant', '65432');
          await clickByName('Mettre à jour');

          // then
          assert.notOk(
            screen.queryByText(
              t('api-error-messages.edit-student-number.student-number-exists', {
                firstName: student.firstName,
                lastName: student.lastName,
              }),
            ),
          );
        });
      },
    );

    module('when the close button is clicked', function () {
      test('it remove errors and student number value', async function (assert) {
        // given
        const screen = await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );

        const error = {
          errors: [
            {
              status: '412',
              detail: 'Error occurred',
            },
          ],
        };

        // when
        stubs.onSaveStudentNumberStub.rejects(error);
        await clickByName(t('common.actions.close'));

        // then
        const submitButton = screen.getByText(
          t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        assert.dom(submitButton).hasValue('');
        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(stubs.closeStub);
      });
    });

    module('when the cancel button is clicked', function () {
      test('it remove errors and student number value too', async function (assert) {
        // given
        const screen = await render(
          <template>
            <SupOrganizationParticipantModalEditStudentNumberModal
              @display={{true}}
              @onClose={{stubs.closeStub}}
              @student={{student}}
              @onSubmit={{stubs.onSaveStudentNumberStub}}
            />
          </template>,
        );

        const error = {
          errors: [
            {
              status: '412',
              detail: 'Error occurred',
            },
          ],
        };

        // when
        stubs.onSaveStudentNumberStub.rejects(error);
        await clickByName('Annuler');

        // then
        const submitButton = screen.getByText(
          t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        assert.dom(submitButton).hasValue('');

        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(stubs.closeStub);
      });
    });
  });

  module('when the edit student number modal is not open', function () {
    test('should not render component', async function (assert) {
      // given
      const display = false;

      const screen = await render(
        <template>
          <SupOrganizationParticipantModalEditStudentNumberModal
            @display={{display}}
            @onClose={{stubs.closeStub}}
            @student={{student}}
          />
        </template>,
      );

      // then
      assert.strictEqual(screen.queryByRole('dialog'), null);
    });
  });
});
