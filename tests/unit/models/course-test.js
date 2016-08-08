import '../../test-helper';
import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel('course',  'Unit | Model | course', function() {

    it('exists', function() {
      let model = this.subject();
      expect(model).to.be.ok;
    });

    it('should have a name', function() {
      let model = this.subject({ name: 'My super test' });
      expect(model.get('name')).to.equal('My super test');
    });

    it('may have a description', function() {
      let model = this.subject({ description: '<p>Coucou les tests</p>' });
      expect(model.get('description')).to.equal('<p>Coucou les tests</p>');
    });
  }
);

