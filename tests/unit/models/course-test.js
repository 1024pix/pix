import '../../test-helper';
import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel('course', 'Unit | Model | Course', {
    needs: [
      'model:assessment',
      'model:challenge'
    ]
  }, function () {

    it('exists', function () {
      let model = this.subject();
      expect(model).to.be.ok;
    });

  }
);

