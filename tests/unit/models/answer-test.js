import '../../test-helper';
import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel('answer',  'Unit | Model | Answer', {
    needs: ['model:assessment', 'model:challenge']
  }, function() {

    it('exists', function() {
      let model = this.subject();
      expect(model).to.be.ok;
    });

  }
);

