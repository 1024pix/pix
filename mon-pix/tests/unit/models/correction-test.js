import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { run } from '@ember/runloop';

describe('Unit | Model | correction', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('correction');
    expect(model).to.be.ok;
  });

  describe('#noHintsNorTutorialsAtAll', function() {

    let model;
    const defaultAttributes = {
      solution: 'a fake solution',
      hint: null,
      tutorials: [],
      learningMoreTutorials: [],
    };

    it('should be true when correction has only solution', function() {
      // given
      model = store.createRecord('correction', defaultAttributes);

      // when
      const result = model.get('noHintsNorTutorialsAtAll');

      // then
      expect(result).to.be.true;
    });

    it('should be false when correction has an hint', function() {
      // given
      model = store.createRecord('correction', Object.assign({}, defaultAttributes, {
        hint: 'a fake hint',
      }));

      // when
      const result = model.get('noHintsNorTutorialsAtAll');

      // then
      expect(result).to.be.false;
    });

    it('should be false when correction has a tutorial', function() {
      // given
      const givenTutorial = run(() => store.createRecord('tutorial', { title: 'is a fake tutorial' }));
      model = store.createRecord('correction', Object.assign({}, defaultAttributes, {
        tutorials: [ givenTutorial ],
      }));

      // when
      const result = model.get('noHintsNorTutorialsAtAll');

      // then
      expect(result).to.be.false;
    });

    it('should be false when correction has a learningMoreTutorial', function() {
      // given
      const givenTutorial = run(() => store.createRecord('tutorial', { title: 'is a fake tutorial' }));
      model = store.createRecord('correction', Object.assign({}, defaultAttributes, {
        learningMoreTutorials: [ givenTutorial ],
      }));

      // when
      const result = model.get('noHintsNorTutorialsAtAll');

      // then
      expect(result).to.be.false;
    });

  });
});
