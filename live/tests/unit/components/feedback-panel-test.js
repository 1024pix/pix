import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | feedback-panel', function () {

  setupTest('component:feedback-panel', {});

  describe('#isFormClosed', function () {

    it('should return true by default', function () {
      // given
      const component = this.subject();

      // when
      const isFormClosed = component.get('isFormClosed');

      // then
      expect(isFormClosed).to.be.true;
    });

    it('should return true if status equals "FORM_CLOSED"', function () {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_CLOSED');

      // when
      const isFormClosed = component.get('isFormClosed');

      // then
      expect(isFormClosed).to.be.true;
    });

    it('should return false if status is not equal to "FORM_CLOSED"', function () {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_OPENED');

      // when
      const isFormClosed = component.get('isFormClosed');

      // then
      expect(isFormClosed).to.be.false;
    });

  });

  describe('#isFormOpened', function () {

    it('should return true if status equals "FORM_OPENED"', function () {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_OPENED');

      // when
      const isFormClosed = component.get('isFormOpened');

      // then
      expect(isFormClosed).to.be.true;
    });

    it('should return false if status is not equal to "FORM_OPENED"', function () {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_CLOSED');

      // when
      const isFormClosed = component.get('isFormOpened');

      // then
      expect(isFormClosed).to.be.false;
    });

  });

});
