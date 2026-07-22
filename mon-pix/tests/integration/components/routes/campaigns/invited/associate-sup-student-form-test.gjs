import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import AssociateSupStudentForm from 'mon-pix/components/routes/organizations/invited/associate-sup-student-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/organizations/invited/associate-sup-student-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  const organizationId = 1;
  let store;
  let saveStub;
  let routerObserver;
  let setAssociationDoneStub;

  hooks.beforeEach(function () {
    stubSessionService(this.owner, { isAuthenticated: false });
    routerObserver = this.owner.lookup('service:router');
    routerObserver.transitionTo = sinon.stub();
    setAssociationDoneStub = sinon.stub();

    store = this.owner.lookup('service:store');
    saveStub = sinon.stub();
    const createRecordMock = sinon.mock();
    createRecordMock.returns({ save: saveStub, unloadRecord: function () {} });
    store.createRecord = createRecordMock;
    const findRecordMock = sinon.mock().returns({ id: 'CAMPAIGN1', type: 'campaign' });
    store.findRecord = findRecordMock;

    class AccessStorageStub extends Service {
      setAssociationDone = setAssociationDoneStub;
    }

    this.owner.register('service:access-storage', AccessStorageStub);
  });

  module('when user fill the form correctly', function () {
    test('should save form', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen });

      // then
      sinon.assert.calledWithExactly(saveStub);
      sinon.assert.calledWithExactly(setAssociationDoneStub, organizationId);
      assert.ok(true);
    });

    test('should transition to fill-in-participant-external-id', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen });

      // then
      sinon.assert.calledWithExactly(
        routerObserver.transitionTo,
        'campaigns.fill-in-participant-external-id',
        'CAMPAIGN1',
      );
      assert.ok(true);
    });
  });

  module('when the server responds an error', function () {
    test('should display server error', async function (assert) {
      // given
      saveStub.rejects();
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen });

      // then
      assert.ok(
        screen.getByText(
          'Veuillez vérifier les informations saisies, ou si vous avez déjà un compte Pix, connectez-vous avec celui-ci.',
        ),
      );
    });
  });

  module('when the form data have errors', function () {
    test('should display an error when student number is not filled', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen, studentNumber: '' });

      // then
      assert.ok(screen.getByText('Votre numéro étudiant n’est pas renseigné.'));
      sinon.assert.notCalled(saveStub);
    });

    test('should display an error when first name is not filled', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen, firstName: '' });

      // then
      assert.ok(screen.getByText('Votre prénom n’est pas renseigné.'));
      sinon.assert.notCalled(saveStub);
    });

    test('should display an error when last name is not filled', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen, lastName: '' });

      // then
      assert.ok(screen.getByText('Votre nom n’est pas renseigné.'));
      sinon.assert.notCalled(saveStub);
    });

    test('should display an error when day of birth is not valid', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen, dayOfBirth: '' });

      // then
      assert.ok(screen.getByText('Votre jour de naissance n’est pas valide.'));
      sinon.assert.notCalled(saveStub);
    });

    test('should display an error when month of birth is not valid', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen, monthOfBirth: '' });

      // then
      assert.ok(screen.getByText('Votre mois de naissance n’est pas valide.'));
      sinon.assert.notCalled(saveStub);
    });

    test('should display an error when year of birth is not valid', async function (assert) {
      // given
      const screen = await render(
        <template><AssociateSupStudentForm @campaignCode="CAMPAIGN1" @organizationId={{organizationId}} /></template>,
      );

      // when
      await _fillInputsAndValidate({ screen, yearOfBirth: '' });

      // then
      assert.ok(screen.getByText('Votre année de naissance n’est pas valide.'));
      sinon.assert.notCalled(saveStub);
    });
  });

  async function _fillInputsAndValidate({
    screen,
    studentNumber = 'F100',
    firstName = 'Jean',
    lastName = 'Bon',
    dayOfBirth = '01',
    monthOfBirth = '01',
    yearOfBirth = '2000',
  }) {
    await fillIn(screen.getByRole('textbox', { name: 'Numéro étudiant' }), studentNumber);
    await fillIn(screen.getByRole('textbox', { name: 'Prénom' }), firstName);
    await fillIn(screen.getByRole('textbox', { name: 'Nom' }), lastName);
    await fillIn(screen.getByRole('spinbutton', { name: 'jour de naissance' }), dayOfBirth);
    await fillIn(screen.getByRole('spinbutton', { name: 'mois de naissance' }), monthOfBirth);
    await fillIn(screen.getByRole('spinbutton', { name: 'année de naissance' }), yearOfBirth);
    await click(screen.getByRole('button', { name: "C'est parti !" }));
  }
});
