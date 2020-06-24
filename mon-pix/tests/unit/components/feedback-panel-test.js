import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Component | feedback-panel', function() {

  setupTest();

  describe('#toggleFeedbackForm', function() {

    it('should open form', function() {
      // given
      const component = this.owner.lookup('component:feedback-panel');
      component.set('_scrollIntoFeedbackPanel', () => {});

      // when
      component.send('toggleFeedbackForm');

      // then
      expect(component.isFormOpened).to.be.true;
    });

    it('should close and reset form', function() {
      // given
      const component = this.owner.lookup('component:feedback-panel');
      component.set('isFormOpened', true);
      component.set('emptyTextBoxMessageError', '10, 9, 8, ...');
      component.set('_isSubmitted', true);

      // when
      component.send('toggleFeedbackForm');

      // then
      expect(component.isFormOpened).to.be.false;
      expect(component._isSubmitted).to.be.false;
      expect(component.emptyTextBoxMessageError).to.be.null;
    });
  });

  describe('#isSendButtonDisabled', function() {

    it('should return false when the feedback has not already been sent', function() {
      // given
      const component = this.owner.lookup('component:feedback-panel');
      component.set('sendButtonStatus', 'unrecorded');

      // when
      const result = component.isSendButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return false when the feedback has already been sent', function() {
      // given
      const component = this.owner.lookup('component:feedback-panel');
      component.set('sendButtonStatus', 'recorded');

      // when
      const result = component.isSendButtonDisabled;

      // then
      expect(result).to.equal(false);
    });

    it('should return true when the send operation is in progress', function() {
      // given
      const component = this.owner.lookup('component:feedback-panel');
      component.set('sendButtonStatus', 'pending');

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
        createRecord: sinon.stub().returns(feedback)
      };
    });

    it('should re-initialise the form correctly', async function() {
      // given
      const component = this.owner.lookup('component:feedback-panel');
      component.set('_category', 'CATEGORY');
      component.set('_content', 'TEXT');
      component.set('store', store);

      // when
      await component.send('sendFeedback');

      // then
      expect(component._category).to.be.null;
      expect(component._content).to.be.null;
      expect(component.nextCategory).to.be.null;
    });

  });
});
