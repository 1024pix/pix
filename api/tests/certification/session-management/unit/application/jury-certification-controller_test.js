import { juryCertificationController } from '../../../../../src/certification/session-management/application/jury-certification-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

describe('Certification | Session-management | Unit | Application | jury-certification-controller', function () {
  describe('#getJuryCertification', function () {
    it('should return serialized jury certification returned by the usecase', async function () {
      // given
      const juryCertificationSerializer = {
        serialize: sinon.stub(),
      };
      const certificationCourseId = 1;
      const request = {
        params: {
          id: certificationCourseId,
        },
        i18n: getI18n(),
      };

      const juryCertification = domainBuilder.buildJuryCertification({
        certificationCourseId: 123,
        sessionId: 456,
        userId: 789,
        assessmentId: 159,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthplace: 'Torreilles',
        birthdate: '2000-08-30',
        birthINSEECode: '66212',
        birthPostalCode: null,
        birthCountry: 'France',
        sex: 'F',
        status: 'rejected',
        isCancelled: false,
        isPublished: true,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-02-01'),
        pixScore: 55,
        juryId: 66,
        commentForCandidate: 'comment candidate',
        commentForOrganization: 'comment organization',
        commentByJury: 'comment jury',
        competenceMarks: [],
        certificationIssueReports: [],
        commonComplementaryCertificationCourseResult: null,
        complementaryCertificationCourseResultWithExternal: null,
      });
      const stubbedUsecase = sinon.stub(usecases, 'getJuryCertification');
      stubbedUsecase.withArgs({ certificationCourseId }).resolves(juryCertification);
      juryCertificationSerializer.serialize.withArgs(juryCertification).returns('ok');

      // when
      const response = await juryCertificationController.getJuryCertification(request, hFake, {
        juryCertificationSerializer,
      });

      // then
      expect(response).to.deep.equal('ok');
    });
  });
});
