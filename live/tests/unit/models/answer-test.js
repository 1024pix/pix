import '../../test-helper';
import Ember from 'ember';
import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel('answer', 'Unit | Model | Answer',
  {
    needs: ['model:assessment', 'model:challenge']
  }, function () {

    it('exists', function () {
      let model = this.subject();
      expect(model).to.be.ok;
    });

    describe('isResultOk', function () {

      it('should return bool', function () {
        Ember.run(() => {
          // given
          const store = this.store();
          const answer = store.createRecord('answer', { 'result': 'ok' });

          expect(answer.get('isResultOk')).to.equal(true);
        });
      });
    });
  }
);

