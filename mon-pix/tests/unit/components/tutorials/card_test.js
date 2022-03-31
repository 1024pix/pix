import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | Tutorial | card item', function () {
  setupTest();

  let component;
  const intl = Service.create({ t: sinon.spy() });
  const tutorial = {
    format: 'son',
    id: 'tutorialId',
  };

  beforeEach(function () {
    component = createGlimmerComponent('component:tutorials/card', { tutorial });
    component.intl = intl;
  });

  describe('#isEvaluateButtonDisabled', function () {
    it('should return false when the tutorial has not already been evaluated', function () {
      // given
      component.evaluationStatus = 'unrecorded';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the tutorial has already been evaluated', function () {
      // given
      component.evaluationStatus = 'recorded';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(true);
    });

    it('should return true when the evaluate operation is in progress', function () {
      // given
      component.evaluationStatus = 'pending';

      // when
      const result = component.isEvaluateButtonDisabled;

      // then
      expect(result).to.equal(true);
    });
  });
});
