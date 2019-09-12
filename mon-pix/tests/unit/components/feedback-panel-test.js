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
      component.set('_scrollToPanel', () => {});

      // when
      component.send('toggleFeedbackForm');

      // then
      expect(component.isFormOpened).to.be.true;
    });

    it('should close and reset form', function() {
      // given
      const component = this.owner.lookup('component:feedback-panel');
      component.set('isFormOpened', true);
      component.set('_error', '10, 9, 8, ...');
      component.set('_isSubmitted', true);

      // when
      component.send('toggleFeedbackForm');

      // then
      expect(component.isFormOpened).to.be.false;
      expect(component._isSubmitted).to.be.false;
      expect(component._error).to.be.null;
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
