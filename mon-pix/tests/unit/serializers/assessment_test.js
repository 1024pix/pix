import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Serializer | assessment', function () {
  setupTest();

  it('should serialize assessment', function () {
    const store = this.owner.lookup('service:store');
    const serializer = this.owner.lookup('serializer:assessment');
    const record = store.createRecord('assessment', {
      certificationNumber: 'cert123',
      codeCampaign: 'campaign123',
      answers: [],
    });
    const snapshot = record._createSnapshot();

    const json = serializer.serialize(snapshot);

    expect(json.data.type).to.equal('assessments');
    expect(json.data.attributes).to.include({
      'certification-number': 'cert123',
      'code-campaign': 'campaign123',
    });
  });

  describe('when adapter options are given', function () {
    it('should add challenge id attribute from adapter options', function () {
      const store = this.owner.lookup('service:store');
      const serializer = this.owner.lookup('serializer:assessment');
      const record = store.createRecord('assessment', { answers: [] });
      const snapshot = record._createSnapshot();
      snapshot.adapterOptions = {
        challengeId: 'challenge1',
      };

      const json = serializer.serialize(snapshot);

      expect(json.data.attributes['challenge-id']).to.equal('challenge1');
    });
  });
});
