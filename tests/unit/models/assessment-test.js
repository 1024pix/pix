import '../../test-helper';
import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel('assessment',  'Unit | Model | Assessment', {
    needs: ['model:course']
  }, function() {

    it('exists', function() {
      let model = this.subject();
      expect(model).to.be.ok;
    });

  }
);

