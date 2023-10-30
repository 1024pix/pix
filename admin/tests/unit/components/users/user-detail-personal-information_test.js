import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('Unit | Component | users | user-detail-personal-information', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:users/user-detail-personal-information');
    component.notifications = {
      success: sinon.stub(),
      error: sinon.stub(),
    };
  });

  module('#dissociate', function (hooks) {
    let organizationLearner;

    hooks.beforeEach(function () {
      organizationLearner = {
        id: 1,
        destroyRecord: sinon.stub(),
      };
    });

    test('it should call destroy on model organization-learner', async function (assert) {
      // given
      component.toggleDisplayDissociateModal(organizationLearner);

      // when
      await component.dissociate(organizationLearner);

      // then
      assert.ok(organizationLearner.destroyRecord.called);
      assert.ok(component.notifications.success.called);
    });

    test('it should notify an error if destroyRecord fail', async function (assert) {
      // given
      organizationLearner.destroyRecord.rejects();

      // when
      await component.dissociate(organizationLearner);

      // then
      assert.ok(component.notifications.error.called);
    });
  });

  module('#translatedType', function () {
    module('when authentication method is GAR', function () {
      test('it should display "Médiacentre"', function (assert) {
        // given
        component.authenticationMethodType = 'GAR';

        // when & then
        assert.strictEqual(component.translatedType, 'Médiacentre');
      });
    });

    module('when authentication method is PIX with email', function () {
      test('it should display "Adresse e-mail"', function (assert) {
        // given
        component.authenticationMethodType = 'EMAIL';

        // when & then
        assert.strictEqual(component.translatedType, 'Adresse e-mail');
      });
    });

    module('when authentication method is PIX with username', function () {
      test('it should display "Identifiant"', function (assert) {
        // given
        component.authenticationMethodType = 'USERNAME';

        // when & then
        assert.strictEqual(component.translatedType, 'Identifiant');
      });
    });

    module('when authentication method is POLE EMPLOI', function () {
      test('it should display "Pôle Emploi"', function (assert) {
        // given
        component.authenticationMethodType = 'POLE_EMPLOI';

        // when & then
        assert.strictEqual(component.translatedType, 'Pôle Emploi');
      });
    });

    module('when authentication method is CNAV', function () {
      test('it should display "CNAV"', function (assert) {
        // given
        component.authenticationMethodType = 'CNAV';

        // when & then
        assert.strictEqual(component.translatedType, 'CNAV');
      });
    });

    module('when authentication method is FWB', function () {
      test('it displays "Fédération Wallonie-Bruxelles"', function (assert) {
        // given
        component.authenticationMethodType = 'FWB';

        // when & then
        assert.strictEqual(component.translatedType, 'Fédération Wallonie-Bruxelles');
      });
    });

    module('when authentication method is PAYSDELALOIRE', function () {
      test('it displays "Pays de la Loire"', function (assert) {
        // given
        component.authenticationMethodType = 'PAYSDELALOIRE';

        // when & then
        assert.strictEqual(component.translatedType, 'Pays de la Loire');
      });
    });
  });
});
