import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Component | certification-progress', function() {

  setupTest();

  describe('@didReceiveAttrs', () => {

    it('should set the current answer number', function() {
      // given
      const component = this.owner.lookup('component:certification-progress');
      const assessment = EmberObject.create({
        answers: [{}, {}],
      });
      component.set('assessment', assessment);
      component.didReceiveAttrs();

      // when
      const currentAnswerNumber = component.get('currentAnswerNumber');

      // then
      expect(currentAnswerNumber).to.equal(3);
    });
  });
});
