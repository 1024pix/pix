import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel(
  'course-group',
  'Unit | Model | course group',
  {
    // Specify the other units that are required for this test.
    needs: []
  },
  function() {
    // Replace this with your real tests.
    it('exists', function() {
      const model = this.subject();
      // var store = this.store();
      expect(model).to.be.ok;
    });
  }
);
