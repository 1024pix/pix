import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Serializer | schooling-registration-user-association', function () {
  setupTest();

  it('serializers test', function () {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('schooling-registration-user-association', {
      studentNumber: '2',
      firstName: null,
    });

    const recordSerialized = record.serialize();

    expect(recordSerialized.data.attributes['student-number']).to.equal('2');
    expect(recordSerialized.data.attributes['first-name']).to.be.undefined;
  });
});
