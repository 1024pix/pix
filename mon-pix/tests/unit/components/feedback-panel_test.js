import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | feedback-panel', function() {
  let component;

  setupTest();

  beforeEach(function() {
    // given
    component = createGlimmerComponent('component:feedback-panel');
  });

  describe('#toggleFeedbackForm', function() {

    it('should open form', function() {
      // when
      component.toggleFeedbackForm();

      // then
      expect(component.isFormOpened).to.be.true;
    });

    it('should close and reset form', function() {
      // given
      component.isFormOpened = true;
      component.emptyTextBoxMessageError = '10, 9, 8, ...';
      component.isFormSubmitted = true;

      // when
      component.toggleFeedbackForm();

      // then
      expect(component.isFormOpened).to.be.false;
      expect(component.isFormSubmitted).to.be.false;
      expect(component.emptyTextBoxMessageError).to.be.null;
    });
  });

  describe('#isSendButtonDisabled', function() {

    it('should return false when the feedback has not already been sent', function() {
      // given
      component._sendButtonStatus = 'unrecorded';

      // when
      const result = component.isSendButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return false when the feedback has already been sent', function() {
      // given
      component._sendButtonStatus = 'recorded';

      // when
      const result = component.isSendButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the send operation is in progress', function() {
      // given
      component._sendButtonStatus = 'pending';

      // when
      const result = component.isSendButtonDisabled;

      // then
      expect(result).to.equal(true);
    });

  });

  describe('#sendFeedback', function() {
    let feedback;
    let store;

    beforeEach(() => {
      feedback = {
        save: sinon.stub().resolves(null),
      };
      store = {
        createRecord: sinon.stub().returns(feedback),
      };
    });

    it('should re-initialise the form correctly', async function() {
      // given
      component._category = 'CATEGORY';
      component.content = 'TEXT';
      component.store = store;

      // when
      await component.sendFeedback();

      // then
      expect(component._category).to.be.null;
      expect(component.content).to.be.null;
      expect(component.nextCategory).to.be.null;
    });

  });
});
