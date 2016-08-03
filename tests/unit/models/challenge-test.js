import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel(
  'challenge',
  'Unit | Model | challenge',
  {
    // Specify the other units that are required for this test.
      needs: []
  },
  function() {
    // Replace this with your real tests.
    it('exists', function() {
      let model = this.subject();
      // var store = this.store();
      expect(model).to.be.ok;
    });

    it('has an instruction', function() {
      let model = this.subject({ instruction: 'Sucrez les fraises.' });

      expect(model.get('instruction')).to.eq('Sucrez les fraises.');
    });
  }
);
