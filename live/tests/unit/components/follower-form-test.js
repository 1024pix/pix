import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

const errorMessages = {
  error: {
    invalid: 'Votre adresse n\'est pas valide',
    exist: 'L\'e-mail choisi est déjà utilisé'
  },
  success: 'Merci pour votre inscription'
};

describe('Unit | Component | followerComponent', function () {

  setupTest('component:follower-form', {});

  describe('#Computed Properties behaviors: ', function () {
    describe('When status get <error>, computed :', function () {
      [
        { attribute: 'hasError', expected: true },
        { attribute: 'isPending', expected: false },
        { attribute: 'hasSuccess', expected: false },
        { attribute: 'errorType', expected: 'invalid' },
        { attribute: 'messageClassName', expected: 'has-error' },
        { attribute: 'infoMessage', expected: errorMessages.error.invalid },
        { attribute: 'submitButtonText', expected: 's\'inscrire' },
        { attribute: 'hasMessage', expected: true },
      ].forEach(({ attribute, expected }) => {
        it(`should return ${expected} when passing ${attribute}`, function () {
          // given
          const component = this.subject();
          // when
          component.set('status', 'error');
          component.set('follower', Ember.Object.create());
          // then
          expect(component.get(attribute)).to.equal(expected);
        });
      });
    });

    describe('When status get <success>, computed :', function () {
      [
        { attribute: 'hasError', expected: false },
        { attribute: 'isPending', expected: false },
        { attribute: 'hasSuccess', expected: true },
        { attribute: 'errorType', expected: 'invalid' },
        { attribute: 'messageClassName', expected: 'has-success' },
        { attribute: 'infoMessage', expected: errorMessages.success },
        { attribute: 'submitButtonText', expected: 's\'inscrire' },
        { attribute: 'hasMessage', expected: true },
      ].forEach(({ attribute, expected }) => {
        it(`should return ${expected} when passing ${attribute}`, function () {
          // given
          const component = this.subject();
          // when
          component.set('status', 'success');
          component.set('follower', Ember.Object.create());
          // then
          expect(component.get(attribute)).to.equal(expected);
        });
      });
    });

  });
});
