import { main } from '../../../../scripts/certification/rescore-certifications.js';
import { expect, knex } from '../../../test-helper.js';

describe('Integration | Scripts | Certification | rescore-certfication', function () {
  it('should save pg boss jobs for each certification course ids', async function () {
    // given
    const certificationsCourseIdList = [1, 2];

    // when
    await main(certificationsCourseIdList);

    // then
    const [job1, job2] = await knex('pgboss.job')
      .where({ name: 'CertificationRescoringByScriptJob' })
      .orderBy('createdon', 'asc');

    expect(job1.data).to.deep.equal({
      certificationCourseId: 1,
    });

    expect(job2.data).to.deep.equal({
      certificationCourseId: 2,
    });
  });
});
