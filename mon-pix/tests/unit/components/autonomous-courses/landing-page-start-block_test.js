import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import Service from '@ember/service';

module('Unit | Component | Autonomous Course | Landing page start block', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('autonomous-course/landing-page-start-block');
    component.args.startCampaignParticipation = sinon.stub().returns('stubbed-transition');

    component.router.transitionTo = sinon.stub();
  });

  module('#redirectToSigninIfUserIsAnonymous', function () {
    module('when user is anonymous', function () {
      test('should redirect to sign-in page on click', async function (assert) {
        // given
        const event = {
          preventDefault: () => {},
        };

        class SessionStub extends Service {
          isAuthenticated = false;
          requireAuthenticationAndApprovedTermsOfService = sinon.stub();
        }
        this.owner.register('service:session', SessionStub);
        const session = this.owner.lookup('service:session');

        // when
        await component.actions.redirectToSigninIfUserIsAnonymous.call(component, event);

        // then
        sinon.assert.calledWith(session.requireAuthenticationAndApprovedTermsOfService, 'stubbed-transition');
        assert.ok(true);
      });
    });

    module('when user is authenticated', function () {
      test('should redirect to next page', async function (assert) {
        // given
        const event = {
          preventDefault: () => {},
        };

        class SessionStub extends Service {
          isAuthenticated = true;
        }
        this.owner.register('service:session', SessionStub);
        this.owner.lookup('service:session');

        // when
        await component.actions.redirectToSigninIfUserIsAnonymous.call(component, event);

        // then
        sinon.assert.calledWith(component.router.transitionTo, 'authenticated');
        assert.ok(true);
      });
    });
  });
});
