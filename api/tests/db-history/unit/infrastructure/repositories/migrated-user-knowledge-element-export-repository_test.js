import { expect } from 'chai';

import {
  dayOf,
  fileName,
} from '../../../../../src/db-history/infrastructure/repositories/migrated-user-knowledge-element-export-repository.ts';

describe('Unit | History-db | Infrastructure | Repository | migrated-user-knowledge-element-export', function () {
  describe('#fileName', function () {
    it('should name the file in the folder of its day, from its first and last ids', function () {
      expect(fileName('2026-03-01', 12, 3456)).to.equal(
        'migrated-user-knowledge-elements/2026/03/01/000000000012_000000003456.parquet',
      );
    });
  });

  describe('#dayOf', function () {
    it('should give the day of the file back from its name', function () {
      expect(dayOf('migrated-user-knowledge-elements/2026/03/01/000000000012_000000003456.parquet')).to.equal(
        '2026-03-01',
      );
    });

    it('should refuse a name without a day', function () {
      expect(() => dayOf('migrated-user-knowledge-elements/000000000012_000000003456.parquet')).to.throw(
        'The export file migrated-user-knowledge-elements/000000000012_000000003456.parquet does not name the day of its rows',
      );
    });
  });
});
