import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';

describe('Unit | Component | tutorial panel', function() {
  setupComponentTest('tutorial-panel', {
    unit: true
  });

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  describe('#shouldDisplayDefaultMessage', function() {

    [ 'ko', 'aband', 'partially', 'timedout', 'default' ].forEach((status) => {
      it(`should return true when resultItemStatus is "${status}" and hint is not defined`, function() {
        // given
        component.set('resultItemStatus', status);
        component.set('hint', null);

        // when
        const result = component.get('shouldDisplayDefaultMessage');

        // then
        expect(result).to.be.true;
      });
    });

    it('should return false when resultItemStatus is "ok" and hint is not defined', function() {
      // given
      component.set('resultItemStatus', 'ok');
      component.set('hint', null);

      // when
      const result = component.get('shouldDisplayDefaultMessage');

      // then
      expect(result).to.be.false;
    });

    [ 'ko', 'aband', 'partially', 'timedout', 'default' ].forEach((status) => {
      it(`should return false when resultItemStatus is "${status}" and hint is defined`, function() {
        // given
        component.set('resultItemStatus', status);
        component.set('hint', 'Un conseil...');

        // when
        const result = component.get('shouldDisplayDefaultMessage');

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#shouldDisplayHint', function() {

    [ 'ko', 'aband', 'partially', 'timedout', 'default' ].forEach((status) => {
      it(`should return true when resultItemStatus is "${status}" and hint is defined`, function() {
        // given
        component.set('resultItemStatus', status);
        component.set('hint', 'Un conseil...');

        // when
        const result = component.get('shouldDisplayHint');

        // then
        expect(result).to.be.true;
      });
    });

    [ 'ko', 'aband', 'partially', 'timedout', 'default' ].forEach((status) => {
      it(`should return false when resultItemStatus is "${status}" and hint is not defined`, function() {
        // given
        component.set('resultItemStatus', status);
        component.set('hint', null);

        // when
        const result = component.get('shouldDisplayHint');

        // then
        expect(result).to.be.false;
      });
    });

    it('should return false when resultItemStatus is "ok"', function() {
      // given
      component.set('resultItemStatus', 'ok');
      component.set('hint', 'Un conseil...');

      // when
      const result = component.get('shouldDisplayHint');

      // then
      expect(result).to.be.false;
    });
  });
});
