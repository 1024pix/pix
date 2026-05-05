import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/users/get/authentication-methods', function (hooks) {
  setupTest(hooks);
  module('#reassignAuthenticationMethodToAnotherUser', function () {
    module('With Pole Emploi identity provider', function () {
      test('should display error message when an 422 error occurred', async function (assert) {
        // given
        const identityProvider = 'POLE_EMPLOI';
        const identityProviderSlug = 'pole-emploi';
        const organizationName = 'Pole Emploi';
        const controller = this.owner.lookup('controller:authenticated.users.get.authentication-methods');

        const originUserId = 1;
        const targetUserId = 2;

        const destroyRecordStub = sinon.stub();
        const rollbackAttributesStub = sinon.stub();
        destroyRecordStub
          .withArgs({
            adapterOptions: {
              reassignAuthenticationMethodToAnotherUser: true,
              targetUserId,
              originUserId,
              identityProvider,
            },
          })
          .rejects({ errors: [{ status: '422' }] });
        const authenticationMethods = [
          EmberObject.create({
            identityProvider,
            destroyRecord: destroyRecordStub,
            rollbackAttributes: rollbackAttributesStub,
          }),
        ];
        const userProfile = EmberObject.create({ id: originUserId, authenticationMethods });

        controller.model = { userProfile, authenticationMethods };
        controller.pixToast = {
          sendSuccessNotification: sinon.stub(),
          sendErrorNotification: sinon.stub(),
        };
        controller.pixToast.sendErrorNotification.resolves();

        const oidcPartner = {
          code: identityProvider,
          slug: identityProviderSlug,
          organizationName: organizationName,
          shouldCloseSession: false,
          source: 'idp',
        };
        const oidcIdentityProvidersService = this.owner.lookup('service:oidcIdentityProviders');
        const storeStub = Service.create({
          findAll: sinon.stub().resolves([Object.create(oidcPartner)]),
          peekAll: sinon.stub().returns([Object.create(oidcPartner)]),
        });
        oidcIdentityProvidersService.set('store', storeStub);

        // when
        await controller.reassignAuthenticationMethod({ targetUserId, identityProvider });

        // then
        sinon.assert.calledWith(controller.pixToast.sendErrorNotification, {
          message: `L'utilisateur a déjà une méthode de connexion ${organizationName}`,
        });
        assert.ok(true);
      });
    });
  });
});
