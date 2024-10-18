import dayjs from 'dayjs';

import { ConvertScoCenterToV3JobController } from '../../../../../../src/certification/configuration/application/jobs/convert-sco-center-to-v3-job-controller.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Application | Certification | Configuration | jobs | convert-center-to-v3-job-controller', function () {
  it('should convert a V2 center to V3 while cleaning stale V2 sessions', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
      isV3Pilot: false,
    }).id;
    const sessionIdV2 = databaseBuilder.factory.buildSession({
      version: 2,
      certificationCenterId,
      date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    }).id;
    await databaseBuilder.commit();

    // when
    const jobController = new ConvertScoCenterToV3JobController();
    await jobController.handle({ data: { centerId: certificationCenterId } });

    // then
    const sessionResult = await knex('sessions').where({ id: sessionIdV2 }).first();
    expect(sessionResult).to.be.undefined;
    const centerResult = await knex('certification-centers').where({ id: certificationCenterId }).first();
    expect(centerResult).not.to.be.undefined;
  });
});
