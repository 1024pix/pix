import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { getOwner } from '@ember/application';

function isFastBoot(owner) {
  const fastboot = owner.lookup('service:fastboot');
  return fastboot ? fastboot.get('isFastBoot') : false;
}

function runIfUnauthenticated(owner, transition, callback) {
  const isFb = isFastBoot(owner);
  const sessionSvc = owner.lookup('service:session');
  if (!sessionSvc.get('isAuthenticated')) {
    if (isFb) {
      const fastboot = owner.lookup('service:fastboot');
      const cookies = owner.lookup('service:cookies');
      cookies.write('ember_simple_auth-redirectTarget', transition.intent.url, {
        path: '/',
        secure: fastboot.get('request.protocol') === 'https'
      });
    } else {
      sessionSvc.set('attemptedTransition', transition);
    }
    callback();
    return false;
  }
  return true;
}

function runIfTermsOfServiceNotAccepted(owner, transition, callback) {
  const sessionSvc = owner.lookup('service:session');
  const currentUser = owner.lookup('service:currentUser');
  if (currentUser.user.mustValidateTermsOfService) {
    sessionSvc.set('attemptedTransition', transition);
    callback();
    return false;
  }
  return true;
}

export default Mixin.create({

  session: service('session'),
  currentUser: service(),
  authenticationRoute: 'login',

  beforeModel(transition) {
    const isAuthenticated = runIfUnauthenticated(getOwner(this), transition, () => {
      this.triggerAuthentication();
    });
    if (isAuthenticated) {
      const hasAcceptedTermsOfService = runIfTermsOfServiceNotAccepted(getOwner(this), transition, () => {
        this.triggerTermsOfServiceSignature();
      });
      console.log(hasAcceptedTermsOfService);
      if (hasAcceptedTermsOfService) {
        return this._super(...arguments);
      }
    }
  },

  triggerAuthentication() {
    const authenticationRoute = this.get('authenticationRoute');
    const owner = getOwner(this);
    const authRouter = owner.lookup('service:router') || owner.lookup('router:main');
    authRouter.transitionTo(authenticationRoute);
  },

  triggerTermsOfServiceSignature() {
    const owner = getOwner(this);
    const authRouter = owner.lookup('service:router') || owner.lookup('router:main');
    authRouter.transitionTo('terms-of-service');
  },
});
