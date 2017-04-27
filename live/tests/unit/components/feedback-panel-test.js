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

  describe('#isFormClosedByDefault', function () {

    it('should return true if no specification', function () {
      // given
      const component = this.subject();

      // when
      const isFormClosedByDefault = component.get('isFormClosedByDefault');

      // then
      expect(isFormClosedByDefault).to.be.true;
    });

    it('should return false if we specified FORM_OPENED', function () {
      // given
      const component = this.subject();
      component.set('default_status', 'FORM_OPENED');

      // when
      const isFormClosedByDefault = component.get('isFormClosedByDefault');

      // then
      expect(isFormClosedByDefault).to.be.false;
    });
  });

  describe('#reset', function () {

    it('should return empty mail, text, error and back to the default status', function () {
      // given
      const component = this.subject();
      component.set('default_status', 'FORM_OPENED');
      component.set('_email', 'un@email.com');
      component.set('_content', 'un contenu');
      component.set('_error', 'une erreur');
      component.set('_status', 'FORM_CLOSED');

      // when
      component.reset();

      // then
      expect(component.get('_email')).to.be.null;
      expect(component.get('_content')).to.be.null;
      expect(component.get('_error')).to.be.null;
      expect(component.get('_status')).to.be.equal(component.get('default_status'));
    });
  });

  describe('#closeForm', function () {

    it('should set status to CLOSED and set errors to null', function () {
      // given
      const component = this.subject();
      component.set('_error', 'une erreur');
      component.set('_status', 'FORM_OPENED');

      // when
      component.closeForm();

      // then
      expect(component.get('_error')).to.be.null;
      expect(component.get('_status')).to.be.equal('FORM_CLOSED');
    });
  });

});
