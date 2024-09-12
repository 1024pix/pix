import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | users | user-detail-personal-information', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:users/user-detail-authentication-methods');
    component.notifications = {
      success: sinon.stub(),
      error: sinon.stub(),
    };
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
        assert.strictEqual(component.translatedType, 'France Travail');
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
