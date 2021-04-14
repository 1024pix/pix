const { sinon, expect, hFake } = require('../../../test-helper');

const assessmentResultController = require('../../../../lib/application/assessment-results/assessment-result-controller');
const assessmentResultService = require('../../../../lib/domain/services/assessment-result-service');

const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const usecases = require('../../../../lib/domain/usecases');
const events = require('../../../../lib/domain/events');
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');

describe('Unit | Controller | assessment-results', () => {

  describe('#save', () => {

    const request = {
      payload: {
        data: {
          attributes: {
            'assessment-id': 2,
            'certification-id': 1,
            level: 3,
            'pix-score': 27,
            status: 'validated',
            emitter: 'Jury',
            'comment-for-jury': 'Envie de faire un nettoyage de printemps dans les notes',
            'comment-for-candidate': 'Tada',
            'comment-for-organization': 'Je suis sûr que vous etes ok avec nous',
            'competences-with-mark': [
              {
                level: 2,
                score: 18,
                'area_code': 2,
                'competence_code': 2.1,
              }, {
                level: 3,
                score: 27,
                'area_code': 3,
                'competence_code': 3.2,
              }, {
                level: 1,
                score: 9,
                'area_code': 1,
                'competence_code': 1.3,
              },
            ],
          },
          type: 'assessment-results',
        },
      },
      auth: {
        credentials: {
          userId: 1,
        },
      },
    };

    beforeEach(() => {

      sinon.stub(assessmentResultService, 'save').resolves();
    });

    it('should return a Assessment Result and an Array of Competence Marks', async () => {
      // given
      const expectedAssessmentResult = new AssessmentResult({
        assessmentId: 2,
        level: 3,
        pixScore: 27,
        status: 'validated',
        emitter: 'Jury',
        commentForJury: 'Envie de faire un nettoyage de printemps dans les notes',
        commentForCandidate: 'Tada',
        commentForOrganization: 'Je suis sûr que vous etes ok avec nous',
        juryId: 1,
      });

      const competenceMark1 = new CompetenceMark({
        level: 2,
        score: 18,
        area_code: 2,
        competence_code: 2.1,
      });
      const competenceMark2 = new CompetenceMark({
        level: 3,
        score: 27,
        area_code: 3,
        competence_code: 3.2,
      });
      const competenceMark3 = new CompetenceMark({
        level: 1,
        score: 9,
        area_code: 1,
        competence_code: 1.3,
      });

      // when
      const response = await assessmentResultController.save(request, hFake);

      // then
      expect(response).to.be.null;
      expect(assessmentResultService.save).to.have.been.calledWithMatch(expectedAssessmentResult, [competenceMark1, competenceMark2, competenceMark3]);
    });
  });

  describe('#neutralizeChallenge', () => {
    it('neutralizes the challenge and dispatches the event', async () => {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              certificationCourseId: 1,
              challengeRecId: 'rec43mpMIR5dUzdjh',
            },
          },
        },
        auth: { credentials: { userId: 7 } },
      };
      const eventToBeDispatched = new ChallengeNeutralized({ certificationCourseId: 1, juryId: 7 });
      sinon.stub(usecases, 'neutralizeChallenge').withArgs({
        certificationCourseId: 1,
        challengeRecId: 'rec43mpMIR5dUzdjh',
        juryId: 7,
      }).resolves(eventToBeDispatched);
      sinon.stub(events, 'eventDispatcher').value({
        dispatch: sinon.stub(),
      });

      // when
      const response = await assessmentResultController.neutralizeChallenge(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWithExactly(eventToBeDispatched);
      expect(response.statusCode).to.equal(204);
    });
  });
});
