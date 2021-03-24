import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | edit-student-number-modal', (hooks) => {
  setupIntlRenderingTest(hooks);
  let closeStub;
  let notificationsStub;
  let onSaveStudentNumberStub;

  hooks.beforeEach(function() {
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

    return render(hbs`<EditStudentNumberModal @display={{display}} @closeModal={{close}} @student={{this.student}} @onSaveStudentNumber={{onSaveStudentNumber}}/>`);
  });

  module('when the edit student number modal is open', () => {

    module('when there is student number', () => {
      test('should render component with student number text', async function(assert) {
        assert.contains(`Numéro étudiant actuel de ${this.student.firstName} ${this.student.lastName} est : ${this.student.studentNumber}`);
      });
    });

    module('when there is no student number yet', () => {
      test('should not render component with student number text', async function(assert) {
        this.student.set('studentNumber', null);
        render(hbs`<EditStudentNumberModal @display={{display}} @closeModal={{close}} @student={{this.student}} @onSaveStudentNumber={{onSaveStudentNumber}}/>`);

        assert.notContains(`Numéro étudiant actuel de ${this.student.firstName} ${this.student.lastName} est : ${this.student.studentNumber}`);
      });
    });

    test('should render component with student number input', async function(assert) {
      assert.dom('#studentNumber').exists();
    });

    test('should render component with update button', async function(assert) {
      assert.contains('Mettre à jour');
    });

    module('When a student number is entered', () => {

      test('should have the update button enable', async function(assert) {
        // when
        await fillInByLabel('Nouveau numéro étudiant', this.student.studentNumber);

        // then
        assert.dom('button[type=submit]').doesNotHaveAttribute('disabled');

      });
    });

    module('when a student number is not entered yet', () => {

      test('should have the update button disable', async function(assert) {
        // when
        await fillInByLabel('Nouveau numéro étudiant', '');
        await clickByLabel('Mettre à jour');

        // then
        assert.dom('button[type=submit]').exists();
        assert.dom('button[type=submit]').hasAttribute('disabled');
      });
    });

    module('when the update button is clicked and a good student number is entered', () => {
      test('it display success notification', async function(assert) {
        // given
        onSaveStudentNumberStub.withArgs(123456).resolves();

        // when
        await fillInByLabel('Nouveau numéro étudiant', 123456);
        await clickByLabel('Mettre à jour');

        // then
        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(closeStub);
        assert.ok(notificationsStub.sendSuccess.calledWith(`La modification du numéro étudiant de ${this.student.firstName} ${this.student.lastName} a bien été effectué.`));
      });
    });

    module('when the update button is clicked and a wrong student number is entered', () => {
      test('it display error message', async function(assert) {
        // when
        await fillInByLabel('Nouveau numéro étudiant', ' ');
        await clickByLabel('Mettre à jour');

        // then
        assert.dom('.error-message').hasText('Le numéro étudiant ne doit pas être vide.');
      });
    });

    module('when the update button is clicked with the student number and this student number already exist', () => {
      test('it display an error under student number input', async function(assert) {
        // given
        const error = {
          errors: [{
            status: '412',
            detail: 'STUDENT_NUMBER_EXISTS',
          }],
        };
        onSaveStudentNumberStub.rejects(error);

        // when
        await fillInByLabel('Nouveau numéro étudiant', 77107);
        await clickByLabel('Mettre à jour');

        // then
        assert.contains(`Le numéro étudiant saisi est déjà utilisé par l’étudiant ${this.student.firstName} ${this.student.lastName}`);
      });
    });

    module('when the update button is clicked with the student number and this student number already exist', () => {
      test('it remove errors when submitting is a success', async function(assert) {
        // given
        const error = {
          errors: [{
            status: '412',
            detail: 'STUDENT_NUMBER_EXISTS',
          }],
        };
        onSaveStudentNumberStub.onFirstCall().rejects(error).onSecondCall().resolves();

        // when
        await fillInByLabel('Nouveau numéro étudiant', 77107);
        await clickByLabel('Mettre à jour');
        await fillInByLabel('Nouveau numéro étudiant', 65432);
        await clickByLabel('Mettre à jour');

        // then
        assert.notContains(`Le numéro étudiant saisi est déjà utilisé par l’étudiant ${this.student.firstName} ${this.student.lastName}`);
      });
    });

    module('when the close button is clicked', () => {
      test('it remove errors and student number value', async function(assert) {
        // given
        const error = {
          errors: [{
            status: '412',
            detail: 'Error occured',
          }],
        };

        // when
        onSaveStudentNumberStub.rejects(error);
        await clickByLabel(this.intl.t('common.actions.close'));

        // then
        assert.dom('button[type=submit]').hasValue('');
        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(closeStub);
      });
    });

    module('when the cancel button is clicked', () => {
      test('it remove errors and student number value too', async function(assert) {
        // given
        const error = {
          errors: [{
            status: '412',
            detail: 'Error occured',
          }],
        };

        // when
        onSaveStudentNumberStub.rejects(error);
        await clickByLabel('Annuler');

        // then
        assert.dom('button[type=submit]').hasValue('');
        assert.dom('.error-message').hasText('');
        sinon.assert.calledOnce(closeStub);
      });
    });
  });

  module('when the edit student number modal is not open', () => {
    test('should not render component', async function(assert) {
      // given
      this.set('display', false);
      render(hbs`<EditStudentNumberModal @display={{display}} @closeModal={{close}} @student={{this.student}}/>`);

      // then
      assert.dom('[aria-modal="true"]').doesNotExist();
    });
  });
});
