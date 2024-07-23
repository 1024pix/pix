import { certificationDetailsController } from '../../../../../src/certification/session-management/application/certification-details-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session-management | Unit | Application | certification-details-controller', function () {
  let certificationDetailsSerializer;

  beforeEach(function () {
    certificationDetailsSerializer = {
      serialize: sinon.stub(),
    };
  });

  describe('#getCertificationDetails', function () {
    it('should return a serialized certification details', async function () {
      // given
      sinon.stub(usecases, 'getCertificationDetails');
      const certificationCourseId = 1234;
      const request = {
        params: {
          id: certificationCourseId,
        },
      };

      usecases.getCertificationDetails.withArgs({ certificationCourseId }).resolves(
        domainBuilder.buildCertificationDetails({
          competencesWithMark: [
            {
              areaCode: '1',
              id: 'recComp1',
              index: '1.1',
              name: 'Manger des fruits',
              obtainedLevel: 1,
              obtainedScore: 5,
              positionedLevel: 3,
              positionedScore: 45,
            },
          ],
          createdAt: '12-02-2000',
          completedAt: '15-02-2000',
          id: 456,
          listChallengesAndAnswers: [
            {
              challengeId: 'rec123',
              competence: '1.1',
              result: 'ok',
              skill: 'manger une mangue',
              value: 'prout',
            },
          ],
          percentageCorrectAnswers: 100,
          status: 'started',
          totalScore: 5,
          userId: 123,
        }),
      );
      certificationDetailsSerializer.serialize.returns('ok');

      // when
      const result = await certificationDetailsController.getCertificationDetails(request, hFake, {
        certificationDetailsSerializer,
      });

      // then
      expect(result).to.deep.equal('ok');
    });
  });
});
