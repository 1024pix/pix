import { main } from '../../../../../scripts/certification/next-gen/convert-centers-to-v3.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Scripts | Certification | convert-centers-to-v3', function () {
  it('should save pg boss jobs for each certification course ids', async function () {
    // given
    const centerId = databaseBuilder.factory.buildCertificationCenter({
      isV3Pilot: false,
      type: CERTIFICATION_CENTER_TYPES.SCO,
    }).id;
    await databaseBuilder.commit();

    // when
    await main({});

    // then
    const [job1] = await knex('pgboss.job').where({ name: 'ConvertCenterToV3Job' }).orderBy('createdon', 'asc');

    expect([job1.data]).to.have.deep.members([{ centerId }]);
  });
});
