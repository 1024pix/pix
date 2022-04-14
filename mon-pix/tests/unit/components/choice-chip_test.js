import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | chips choice', function () {
  setupTest();

  let component;

  beforeEach(function () {
    component = createGlimmerComponent('component:chips-choice');
  });

  describe('#className', function () {
    it("should return 'chips-choice' when isDisabled is not defined", function () {
      // when
      const result = component.className;

      // then
      expect(result).to.equal('choice-chip');
    });
    it("should return 'chips-choice chips-choice--disabled' when isDisabled is true", function () {
      // given
      component.args.isDisabled = true;

      // when
      const result = component.className;

      // then
      expect(result).to.equal('choice-chip choice-chip--disabled');
    });
    it("should return 'chips-choice' when isDisabled is false", function () {
      // given
      component.args.isDisabled = false;

      // when
      const result = component.className;

      // then
      expect(result).to.equal('choice-chip');
    });
  });
});
