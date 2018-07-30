import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | feedback-panel', function() {

  setupTest('component:feedback-panel', {});

  describe('#isFormClosed', function() {

    it('should return true by default', function() {
      // given
      const component = this.subject();

      // when
      const isFormClosed = component.get('isFormClosed');

      // then
      expect(isFormClosed).to.be.true;
    });

    it('should return true if status equals "FORM_CLOSED"', function() {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_CLOSED');

      // when
      const isFormClosed = component.get('isFormClosed');

      // then
      expect(isFormClosed).to.be.true;
    });

    it('should return false if status is not equal to "FORM_CLOSED"', function() {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_OPENED');

      // when
      const isFormClosed = component.get('isFormClosed');

      // then
      expect(isFormClosed).to.be.false;
    });
  });

  describe('#isFormOpened', function() {

    it('should return true if status equals "FORM_OPENED"', function() {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_OPENED');

      // when
      const isFormClosed = component.get('isFormOpened');

      // then
      expect(isFormClosed).to.be.true;
    });

    it('should return false if status is not equal to "FORM_OPENED"', function() {
      // given
      const component = this.subject();
      component.set('_status', 'FORM_CLOSED');

      // when
      const isFormClosed = component.get('isFormOpened');

      // then
      expect(isFormClosed).to.be.false;
    });

  });

  describe('#_reset', function() {

    it('should return empty mail, text, error and back to the default status', function() {
      // given
      const component = this.subject();
      component.set('collapsible', false);
      component.set('_email', 'un@email.com');
      component.set('_content', 'un contenu');
      component.set('_error', 'une erreur');
      component.set('_status', 'FORM_CLOSED');

      // when
      component._reset();

      // then
      expect(component.get('_email')).to.be.null;
      expect(component.get('_content')).to.be.null;
      expect(component.get('_error')).to.be.null;
      expect(component.get('_status')).to.be.equal('FORM_OPENED');
    });
  });

  describe('#_closeForm', function() {

    it('should set status to CLOSED and set errors to null', function() {
      // given
      const component = this.subject();
      component.set('_error', 'une erreur');
      component.set('_status', 'FORM_OPENED');

      // when
      component._closeForm();

      // then
      expect(component.get('_error')).to.be.null;
      expect(component.get('_status')).to.be.equal('FORM_CLOSED');
    });
  });

  describe('#_getDefaultStatus', function() {

    it('should return FORM_CLOSED if has property collapsible at "true"', function() {
      // given
      const component = this.subject();
      component.set('collapsible', true);

      // when
      const defaultStatus = component._getDefaultStatus();

      // then
      expect(defaultStatus).to.equal('FORM_CLOSED');
    });

    it('should return FORM_OPENED if has property collapsible at "false"', function() {
      // given
      const component = this.subject();
      component.set('collapsible', false);

      // when
      const defaultStatus = component._getDefaultStatus();

      // then
      expect(defaultStatus).to.equal('FORM_OPENED');
    });
  });
});
