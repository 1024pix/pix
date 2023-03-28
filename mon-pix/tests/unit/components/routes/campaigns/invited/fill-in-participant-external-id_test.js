import { module, test } from 'qunit';
import sinon from 'sinon';
import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Component | routes/campaigns/invited/fill-in-participant-external-id', function (hooks) {
  setupIntlRenderingTest(hooks);

  const campaign = {
    id: 1243,
    code: 'CODECAMPAIGN',
    idPixLabel: 'Identifiant professionnel',
  };
  const participantExternalId = 'matricule123';

  let component;
  let onSubmitStub;
  let onCancelStub;
  let eventStub;

  hooks.beforeEach(function () {
    onSubmitStub = sinon.stub();
    onCancelStub = sinon.stub();
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/invited/fill-in-participant-external-id', {
      campaign,
      onSubmit: onSubmitStub,
      onCancel: onCancelStub,
    });
  });

  module('#submit', function () {
    test('should succeed when participantExternalId is correct', async function (assert) {
      // given
      component.participantExternalId = participantExternalId;

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.calledWith(onSubmitStub, participantExternalId);
      sinon.assert.called(eventStub.preventDefault);
      assert.ok(true);
    });

    test('should display error when participant external id is empty', async function (assert) {
      // given
      component.participantExternalId = '';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      assert.strictEqual(component.errorMessage, `Merci de renseigner votre ${component.args.campaign.idPixLabel}.`);
    });

    test('should display error when participant external id exceed 255 characters', async function (assert) {
      // given
      component.participantExternalId =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      assert.strictEqual(
        component.errorMessage,
        `Votre ${component.args.campaign.idPixLabel} ne doit pas dépasser les 255 caractères.`
      );
    });
  });

  module('#cancel', function () {
    test('should abort and call its parent method', async function (assert) {
      // when
      await component.actions.cancel.call(component);

      // then
      sinon.assert.called(onCancelStub);
      assert.ok(true);
    });
  });
});
