const { expect, sinon, domainBuilder } = require('../../../test-helper');
const BookshelfAssessmentResults = require('../../../../lib/infrastructure/orm-models/AssessmentResult');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Domain | Models | BookshelfAssessmentResult', function() {

  describe('validation', function() {

    let rawData;

    beforeEach(function() {
      rawData = {
        emitter: '',
        status: null,
      };
    });

    describe('the status field', function() {

      it('should only accept specific values', function() {
        // given
        rawData.status = 'not_a_correct_status';
        const certification = new BookshelfAssessmentResults(rawData);

        // when
        const promise = certification.save();

        // then
        return promise
          .then(() => {
            sinon.assert.fail('Cannot succeed');
          })
          .catch((err) => {
            const status = err.data['status'];
            expect(status).to.exist.and.to.deep.equal(['Le status de la certification n\'est pas valide']);
          });
      });
    });
  });

  describe('#buildAlgoErrorResult', function() {

    it('should return an algo error AssessmentResult', function() {
      // given
      const error = {
        message: 'message for jury',
      };

      // when
      const actualAssessmentResult = AssessmentResult.buildAlgoErrorResult({
        error,
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
        commentForJury: 'message for jury',
        status: AssessmentResult.status.ERROR,
        pixScore: 0,
        competenceMarks: [],
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.commentForCandidate = undefined;
      expectedAssessmentResult.commentForOrganization = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildStandardAssessmentResult', function() {

    it('should return a standard AssessmentResult', function() {
      // when
      const actualAssessmentResult = AssessmentResult.buildStandardAssessmentResult({
        pixScore: 55,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
        commentForJury: 'Computed',
        status: AssessmentResult.status.VALIDATED,
        pixScore: 55,
        competenceMarks: [],
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.commentForCandidate = undefined;
      expectedAssessmentResult.commentForOrganization = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildNotTrustableAssessmentResult', function() {

    it('should return a not trustable AssessmentResult', function() {
      // when
      const actualAssessmentResult = AssessmentResult.buildNotTrustableAssessmentResult({
        pixScore: 55,
        status: AssessmentResult.status.VALIDATED,
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
      });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        juryId: 456,
        emitter: 'Moi',
        commentForJury: 'Computed',
        status: AssessmentResult.status.VALIDATED,
        pixScore: 55,
        competenceMarks: [],
        commentForCandidate: 'Un ou plusieurs problème(s) technique(s), signalé(s) à votre surveillant pendant la session de certification' +
          ', a/ont affecté la qualité du test de certification. En raison du trop grand nombre de questions auxquelles vous ' +
          'n\'avez pas pu répondre dans de bonnes conditions, nous ne sommes malheureusement pas en mesure de calculer un ' +
          'score fiable et de fournir un certificat. La certification est annulée, le prescripteur de votre certification' +
          '(le cas échéant), en est informé.',
        commentForOrganization: 'Un ou plusieurs problème(s) technique(s), signalés par ce(cette) candidate au surveillant' +
          'de la session de certification, a/ont affecté le bon déroulement du test de certification. Nous sommes dans ' +
          'l\'incapacité de le/la certifier, sa certification est donc annulée. Cette information est à prendre en compte ' +
          'et peut vous conduire à proposer une nouvelle session de certification pour ce(cette) candidat(e).',
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#buildStartedAssessmentResult', function() {

    it('should return a started AssessmentResult', function() {
      // when
      const actualAssessmentResult = AssessmentResult.buildStartedAssessmentResult({ assessmentId: 123 });

      // then
      const expectedAssessmentResult = domainBuilder.buildAssessmentResult({
        assessmentId: 123,
        status: Assessment.states.STARTED,
        competenceMarks: [],
      });
      expectedAssessmentResult.id = undefined;
      expectedAssessmentResult.commentForCandidate = undefined;
      expectedAssessmentResult.commentForOrganization = undefined;
      expectedAssessmentResult.commentForJury = undefined;
      expectedAssessmentResult.createdAt = undefined;
      expectedAssessmentResult.emitter = undefined;
      expectedAssessmentResult.juryId = undefined;
      expectedAssessmentResult.pixScore = undefined;
      expect(actualAssessmentResult).to.deepEqualInstance(expectedAssessmentResult);
    });
  });

  describe('#isValidated', function() {

    it('should return true if the assessment result is validated', function() {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.validated();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.true;
    });

    it('should return false if the assessment result is rejected', function() {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.rejected();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.false;
    });

    it('should return false if the assessment result is in error', function() {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.error();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.false;
    });

    it('should return false if the assessment result is started', function() {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult.started();

      // when
      const isValidated = assessmentResult.isValidated();

      // then
      expect(isValidated).to.be.false;
    });
  });
});
