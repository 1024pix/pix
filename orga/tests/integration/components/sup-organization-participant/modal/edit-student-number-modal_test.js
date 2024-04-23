import { clickByName, fillByLabel, getDefaultNormalizer, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | SupOrganizationParticipant::Modal::EditStudentNumberModal', function (hooks) {
  setupIntlRenderingTest(hooks);
  let closeStub;
  let notificationsStub;
  let onSaveStudentNumberStub;

  hooks.beforeEach(function () {
    this.student = EmberObject.create({
      id: '123',
      firstName: 'Lyanna',
      lastName: 'Mormont',
      studentNumber: '1234',
    });

    onSaveStudentNumberStub = sinon.stub();

    notificationsStub = this.owner.lookup('service:notifications');

    closeStub = sinon.stub();

    sinon.stub(notificationsStub, 'sendSuccess');

    this.set('display', true);
    this.set('close', closeStub);
    this.set('onSaveStudentNumber', onSaveStudentNumberStub);
  });

  module('when the edit student number modal is open', function () {
    module('when there is student number', function () {
      test('should render component with student number text', async function (assert) {
        const screen = await render(
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
        );

        assert.ok(
          screen.getByText(
            this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.student-number', {
              firstName: this.student.firstName,
              lastName: this.student.lastName,
            }),
            // WARNING : nous avons ici un problème de rupture de la séparation des responsabilité
            // ce pourquoi nous sommes obligés de renseigner `normalizer: getDefaultNormalizer({ trim: false })z.
            // TODO :gérer les espaces en fin de texte avec du css et non dans les clés de traduction
            { exact: false, normalizer: getDefaultNormalizer({ trim: false }) },
          ),
        );
        assert.ok(screen.getByText(this.student.studentNumber));
      });
    });

    module('when there is no student number yet', function () {
      test('should not render component with student number text', async function (assert) {
        this.student.set('studentNumber', null);
        const screen = await render(
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
        );

        assert.notOk(
          screen.queryByText(
            this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.student-number', {
              firstName: this.student.firstName,
              lastName: this.student.lastName,
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
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
        );

        // when
        await fillByLabel(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          this.student.studentNumber,
        );

        const submitButton = screen.getByText(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        // then
        assert.dom(submitButton).doesNotHaveAttribute('disabled');
      });
    });

    module('when a student number is not entered yet', function () {
      test('should have the update button disable', async function (assert) {
        const screen = await render(
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
        );

        // when
        await fillByLabel(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          'toto',
        );
        await clickByName(this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'));

        // then
        const submitButton = screen.getByText(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        assert.ok(submitButton.hasAttribute('disabled'));
      });
    });

    module('when the update button is clicked and a good student number is entered', function () {
      test('it display success notification', async function (assert) {
        await render(
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
        );
        // given
        onSaveStudentNumberStub.withArgs(123456).resolves();

        // when
        await fillByLabel(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          '123456',
        );
        await clickByName(this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'));

        // then
        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(closeStub);
        assert.ok(
          notificationsStub.sendSuccess.calledWith(
            `La modification du numéro étudiant de ${this.student.firstName} ${this.student.lastName} a bien été effectué.`,
          ),
        );
      });
    });

    module('when the update button is clicked and a wrong student number is entered', function () {
      test('it display error message', async function (assert) {
        const screen = await render(
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
        );

        // when
        await fillByLabel(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
          ' ',
        );
        await clickByName(this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'));

        // then
        assert.ok(
          screen.getByText(this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.error')),
        );
      });
    });

    module(
      'when the update button is clicked with the student number and this student number already exist',
      function () {
        test('it display an error under student number input', async function (assert) {
          // given
          const screen = await render(
            hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
          );

          const error = {
            errors: [
              {
                status: '412',
                detail: 'STUDENT_NUMBER_EXISTS',
              },
            ],
          };
          onSaveStudentNumberStub.rejects(error);

          // when
          await fillByLabel(
            this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label'),
            '77107',
          );
          await clickByName(
            this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
          );

          // then
          assert.ok(
            screen.getByText(
              this.intl.t('api-error-messages.edit-student-number.student-number-exists', {
                firstName: this.student.firstName,
                lastName: this.student.lastName,
              }),
            ),
          );
        });

        test('it remove errors when submitting is a success', async function (assert) {
          // given
          const screen = await render(
            hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
          );

          const error = {
            errors: [
              {
                status: '412',
                detail: 'STUDENT_NUMBER_EXISTS',
              },
            ],
          };
          onSaveStudentNumberStub.onFirstCall().rejects(error).onSecondCall().resolves();

          // when
          await fillByLabel('Nouveau numéro étudiant', '77107');
          await clickByName('Mettre à jour');
          await fillByLabel('Nouveau numéro étudiant', '65432');
          await clickByName('Mettre à jour');

          // then
          assert.notOk(
            screen.queryByText(
              this.intl.t('api-error-messages.edit-student-number.student-number-exists', {
                firstName: this.student.firstName,
                lastName: this.student.lastName,
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
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
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
        onSaveStudentNumberStub.rejects(error);
        await clickByName(this.intl.t('common.actions.close'));

        // then
        const submitButton = screen.getByText(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        assert.dom(submitButton).hasValue('');
        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(closeStub);
      });
    });

    module('when the cancel button is clicked', function () {
      test('it remove errors and student number value too', async function (assert) {
        // given
        const screen = await render(
          hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
  @onSubmit={{this.onSaveStudentNumber}}
/>`,
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
        onSaveStudentNumberStub.rejects(error);
        await clickByName('Annuler');

        // then
        const submitButton = screen.getByText(
          this.intl.t('pages.sup-organization-participants.edit-student-number-modal.actions.update'),
        );

        assert.dom(submitButton).hasValue('');

        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(closeStub);
      });
    });
  });

  module('when the edit student number modal is not open', function () {
    test('should not render component', async function (assert) {
      // given
      this.set('display', false);

      const screen = await render(
        hbs`<SupOrganizationParticipant::Modal::EditStudentNumberModal
  @display={{this.display}}
  @onClose={{this.close}}
  @student={{this.student}}
/>`,
      );

      // then
      assert.strictEqual(screen.queryByRole('dialog'), null);
    });
  });
});
