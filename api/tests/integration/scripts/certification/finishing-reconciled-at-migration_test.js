import { main } from '../../../../scripts/certification/finishing-reconciled-at-migration.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Scripts | Certification | finishing-reconciled-at-migration', function () {
  it('should fix the missing reconciledAt', async function () {
    // given
    const courseDate = new Date('2024-10-29');
    const sessionId = databaseBuilder.factory.buildSession({}).id;

    const userIdOne = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCourse({ userId: userIdOne, sessionId, createdAt: courseDate });
    const candidateIdOne = databaseBuilder.factory.buildCertificationCandidate({
      userId: userIdOne,
      sessionId,
    }).id;

    const userIdTwo = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCourse({ userId: userIdTwo, sessionId, createdAt: courseDate });
    const candidateIdTwo = databaseBuilder.factory.buildCertificationCandidate({
      userId: userIdTwo,
      sessionId,
    }).id;

    const userIdThree = databaseBuilder.factory.buildUser().id;
    const candidateIdWithNoCourse = databaseBuilder.factory.buildCertificationCandidate({
      userId: userIdThree,
      sessionId,
    }).id;
    await databaseBuilder.commit();

    // Creating the issue we wanna fix in database
    await knex('certification-candidates')
      .update({ reconciledAt: null })
      .whereIn('id', [candidateIdOne, candidateIdTwo, candidateIdWithNoCourse]);

    // when
    await main({ chunkSize: 1 });

    // then
    const reconciledAts = await knex('certification-candidates')
      .pluck('reconciledAt')
      .whereIn('id', [candidateIdOne, candidateIdTwo]);

    expect(reconciledAts).to.have.lengthOf(2);
    for (const reconciledAt of reconciledAts) {
      expect(reconciledAt).to.deep.equal(courseDate);
    }

    const reconciledAtForNoCourse = await knex('certification-candidates')
      .pluck('reconciledAt')
      .where('id', candidateIdWithNoCourse);
    expect(reconciledAtForNoCourse[0]).to.be.null;
  });
});
