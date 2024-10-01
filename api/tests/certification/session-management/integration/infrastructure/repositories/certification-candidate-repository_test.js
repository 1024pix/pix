import * as certificationCandidateRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/certification-candidate-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Certification Candidate', function () {
  describe('#getByCertificationCourseId', function () {
    it('should return a candidate', async function () {
      // given
      const reconciledAt = new Date('2024-01-02');
      const userId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId }).id;
      databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        userId,
        reconciledAt,
      }).id;

      await databaseBuilder.commit();

      // when
      const candidate = await certificationCandidateRepository.getByCertificationCourseId({ certificationCourseId });

      // then
      expect(candidate).to.deep.equal({
        reconciledAt,
        userId,
      });
    });

    context('When the candidate does not exist', function () {
      it('throws a not found error', async function () {
        // when
        const error = await catchErr(certificationCandidateRepository.getByCertificationCourseId)({
          certificationCourseId: 404,
        });
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });
});
