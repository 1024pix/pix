import * as certificationCandidateRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/certification-candidate-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Certification Candidate', function () {
  describe('#getByCertificationCourseId', function () {
    it('should return a candidate', async function () {
      // given
      const reconciledAt = new Date('2024-01-02');
      const resultRecipientEmail = 'result.recipient@email.net';
      const userId = databaseBuilder.factory.buildUser().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ sessionId }).id;
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        userId,
        reconciledAt,
        resultRecipientEmail,
      }).id;

      await databaseBuilder.commit();

      // when
      const candidate = await certificationCandidateRepository.getByCertificationCourseId({ certificationCourseId });

      // then
      expect(candidate).to.deep.equal({
        id: certificationCandidateId,
        userId,
        reconciledAt,
        resultRecipientEmail,
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
