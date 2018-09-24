const { sinon, expect } = require('../../../test-helper');

const Boom = require('boom');
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
    let replyStub;

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
      sandbox = sinon.sandbox.create();

      replyStub = sinon.stub().returns({ code: sinon.stub() });
      sandbox.stub(usecases, 'createAssessmentResultForCompletedCertification').resolves();
      sandbox.stub(Boom, 'notFound').returns({ message: 'NotFoundError' });
      sandbox.stub(Boom, 'badImplementation').returns({ message: 'badImplementation' });
      sandbox.stub(logger, 'error');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should evaluate the assessment', () => {
      // when
      assessmentResultController.evaluate(request, replyStub);

      // then
      expect(usecases.createAssessmentResultForCompletedCertification).to.have.been.calledWith({
        assessmentId: '22',
        forceRecomputeResult: false,
      });
    });

    it('should return 404 when the assessment is not found', () => {
      // given
      const notFoundAssessmentError = new NotFoundError();
      usecases.createAssessmentResultForCompletedCertification.rejects(notFoundAssessmentError);

      // when
      const promise = assessmentResultController.evaluate(request, replyStub);

      // then
      return promise.then(() => {
        expect(Boom.notFound).to.have.been.calledWith(notFoundAssessmentError);
        expect(replyStub).to.have.been.calledWith({ message: 'NotFoundError' });
      });
    });

    context('when the assessment is already evaluated', () => {

      it('should do nothing', () => {
        // given
        const alreadyRatedAssessmentError = new AlreadyRatedAssessmentError();
        usecases.createAssessmentResultForCompletedCertification.rejects(alreadyRatedAssessmentError);
        const jsonApiError = new JSONAPIError({
          status: '412',
          title: 'Assessment is already rated',
          detail: 'The assessment given has already a result.'
        });

        // when
        const promise = assessmentResultController.evaluate(request, replyStub);

        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.called;
          expect(replyStub).to.have.been.calledWith(jsonApiError);
        });
      });
    });

    context('when the database is fail', () => {

      it('should reply with an internal error', () => {
        // given
        const undefinedError = new Error();
        usecases.createAssessmentResultForCompletedCertification.rejects(undefinedError);

        // when
        const promise = assessmentResultController.evaluate(request, replyStub);

        // then
        return promise.then(() => {
          expect(Boom.badImplementation).to.have.been.calledWith(undefinedError);
          expect(replyStub).to.have.been.calledWith(Boom.badImplementation());
        });
      });
    });
  });

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
      sinon.stub(assessmentResultService, 'save').resolves();
    });

    afterEach(() => {
      assessmentResultService.save.restore();
    });

    it('should return a Assessment Result and an Array of Competence Marks', () => {
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
      const promise = assessmentResultController.save(request, sinon.stub());

      // then
      return promise.then(() => {
        expect(assessmentResultService.save).to.have.been.calledWith(expectedAssessmentResult, [competenceMark1, competenceMark2, competenceMark3]);
      });
    });
  });
});
