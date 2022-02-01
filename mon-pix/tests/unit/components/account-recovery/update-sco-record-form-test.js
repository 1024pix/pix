import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | account-recovery | update-sco-record-form', function () {
  setupTest();

  context('#isSubmitButtonEnabled', function () {
    it('should return false if password is not valid and cgu are not accepted', function () {
      // given
      const component = createGlimmerComponent('component:account-recovery/update-sco-record-form');
      component.password = 'Pass';
      component.cguAndProtectionPoliciesAccepted = false;

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      expect(result).to.be.false;
    });

    it('should return false if password is valid and cgu are not accepted', function () {
      // given
      const component = createGlimmerComponent('component:account-recovery/update-sco-record-form');
      component.password = 'Password123';
      component.cguAndProtectionPoliciesAccepted = false;

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      expect(result).to.be.false;
    });

    it('should return true if password is valid and cgu are accepted', function () {
      // given
      const component = createGlimmerComponent('component:account-recovery/update-sco-record-form');
      component.password = 'Password123';
      component.cguAndProtectionPoliciesAccepted = true;

      // when
      const result = component.isSubmitButtonEnabled;

      // then
      expect(result).to.be.true;
    });
  });
});
