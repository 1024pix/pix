import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | tutorial-evaluation model', function () {
  setupTest();

  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  describe('#nextStatus', function () {
    it('should return "NEUTRAL" when current status is "LIKED"', function () {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'LIKED';

      // when & then
      expect(model.nextStatus).to.equal('NEUTRAL');
    });

    it('should return "LIKED" when current status is different from "LIKED"', function () {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'NEUTRAL';

      // when & then
      expect(model.nextStatus).to.equal('LIKED');
    });
  });

  describe('#isLiked', function () {
    it('should return true if status is "LIKED"', function () {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'LIKED';

      // when & then
      expect(model.isLiked).to.be.true;
    });

    it('should return false if status is "NEUTRAL"', function () {
      // given
      const model = store.createRecord('tutorial-evaluation');
      model.status = 'NEUTRAL';

      // when & then
      expect(model.isLiked).to.be.false;
    });
  });
});
