const { sinon, expect, hFake } = require('../../../test-helper');

const JSONAPIError = require('jsonapi-serializer').Error;

const assessmentResultController = require('../../../../lib/application/assessment-results/assessment-result-controller');
const assessmentResultService = require('../../../../lib/domain/services/assessment-result-service');

const { AlreadyRatedAssessmentError, NotFoundError } = require('../../../../lib/domain/errors');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const usecases = require('../../../../lib/domain/usecases');

const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Controller | assessment-results', () => {

  describe('#evaluate', () => {

    let sandbox;

    const request = {
      payload: {
        data: {
          attributes: {
            'estimated-level': null,
            'pix-score': null
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: '22'
              }
            }
          },
          type: 'assessment-results'
        }
      }
    };

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'createAssessmentResultForCompletedAssessment').resolves();
      sandbox.stub(logger, 'error');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should evaluate the assessment', async () => {
      // when
      const response = await assessmentResultController.evaluate(request, hFake);

      // then
      expect(usecases.createAssessmentResultForCompletedAssessment).to.have.been.calledWith({
        assessmentId: '22',
        forceRecomputeResult: false,
      });
      expect(response).to.equal('');
    });

    it('should return 404 when the assessment is not found', () => {
      // given
      const notFoundError = new NotFoundError('Assessment 123 not found');
      usecases.createAssessmentResultForCompletedAssessment.rejects(notFoundError);

      // when
      const promise = assessmentResultController.evaluate(request, hFake);

      // then
      return expect(promise).to.be.rejected
        .and.eventually.to.include.nested({
          'message': 'Assessment 123 not found',
          'output.statusCode': 404
        });
    });

    context('when the assessment is already evaluated', () => {

      it('should do nothing', async () => {
        // given
        const alreadyRatedAssessmentError = new AlreadyRatedAssessmentError();
        usecases.createAssessmentResultForCompletedAssessment.rejects(alreadyRatedAssessmentError);
        const jsonApiError = new JSONAPIError({
          status: '412',
          title: 'Assessment is already rated',
          detail: 'The assessment given has already a result.'
        });

        // when
        const response = await assessmentResultController.evaluate(request, hFake);

        // then
        expect(response.statusCode).to.equal(412);
        expect(response.source).to.deep.equal(jsonApiError);
      });
    });

    context('when the database fails', () => {

      it('should reply with an internal error', () => {
        // given
        const undefinedError = new Error();
        usecases.createAssessmentResultForCompletedAssessment.rejects(undefinedError);

        // when
        const promise = assessmentResultController.evaluate(request, hFake);

        // then
        return expect(promise).to.be.rejected
          .and.eventually.to.include.nested({
            'output.statusCode': 500
          });
      });
    });
  });

  describe('#save', () => {

    let sandbox;

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
                'area-code': 2,
                'competence-code': 2.1
              }, {
                level: 3,
                score: 27,
                'area-code': 3,
                'competence-code': 3.2
              }, {
                level: 1,
                score: 9,
                'area-code': 1,
                'competence-code': 1.3
              }
            ]
          },
          type: 'assessment-results'
        }
      },
      auth: {
        credentials: {
          userId: 1
        }
      }
    };

    beforeEach(() => {
      sandbox = sinon.createSandbox();

      sandbox.stub(assessmentResultService, 'save').resolves();
    });

    afterEach(() => {
      sandbox.restore();
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
        juryId: 1
      });

      const competenceMark1 = new CompetenceMark({
        level: 2,
        score: 18,
        area_code: 2,
        competence_code: 2.1
      });
      const competenceMark2 = new CompetenceMark({
        level: 3,
        score: 27,
        area_code: 3,
        competence_code: 3.2
      });
      const competenceMark3 = new CompetenceMark({
        level: 1,
        score: 9,
        area_code: 1,
        competence_code: 1.3
      });

      // when
      const response = await assessmentResultController.save(request, hFake);

      // then
      expect(response).to.equal('');
      expect(assessmentResultService.save).to.have.been.calledWith(expectedAssessmentResult, [competenceMark1, competenceMark2, competenceMark3]);
    });
  });
});
