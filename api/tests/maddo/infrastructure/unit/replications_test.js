import { expect } from 'chai';

import { replications } from '../../../../src/maddo/infrastructure/replications.ts';

describe('Maddo | Infrastructure | Unit | replications', function () {
  it('should declare, for every replication, a source table, a target table and non-empty columns', function () {
    expect(Object.keys(replications)).to.not.be.empty;

    for (const [name, replication] of Object.entries(replications)) {
      expect(replication.source, name).to.be.a('string').that.is.not.empty;
      expect(replication.target, name).to.be.a('string').that.is.not.empty;
      const columns = Array.isArray(replication.columns) ? replication.columns : Object.keys(replication.columns);
      expect(columns, name).to.be.an('array').that.is.not.empty;
      expect(new Set(columns).size, `${name}: duplicated column`).to.equal(columns.length);
    }
  });
});
