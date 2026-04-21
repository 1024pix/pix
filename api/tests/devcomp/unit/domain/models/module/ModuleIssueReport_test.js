import { ModuleIssueReport } from '../../../../../../src/devcomp/domain/models/module/ModuleIssueReport.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';

import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Module | ModuleIssueReport', function () {
  describe('#constructor', function () {
    it('should create an issue report corresponding to attributes', function () {
      // given
      const moduleId = '7d2a96d8-b7e3-4b97-acbf-5e51aa892279';
      const elementId = '0aed9f0d-e735-48f8-900b-32cc4251dd0e';
      const passageId = 2571;
      const answer = 'ma super réponse';
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0';
      const categoryKey = "C'est tout cassé";
      const comment = "C'est tout cassé";

      // when
      const issueReport = moduleIssueReportBuilder({ comment });

      // then
      expect(issueReport.moduleId).to.equal(moduleId);
      expect(issueReport.elementId).to.equal(elementId);
      expect(issueReport.passageId).to.equal(passageId);
      expect(issueReport.answer).to.equal(answer);
      expect(issueReport.userAgent).to.equal(userAgent);
      expect(issueReport.categoryKey).to.equal(categoryKey);
      expect(issueReport.comment).to.equal(comment);
    });

    describe('if a comment contains only a space', function () {
      it('should throw an error', function () {
        // given
        const commentWithOneSpaceOnly = ' ';

        // when
        const error = catchErrSync(() => moduleIssueReportBuilder({ comment: commentWithOneSpaceOnly }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The comment should not be empty');
      });
    });

    describe('if a comment is empty', function () {
      it('should throw an error', function () {
        // given
        const emptyComment = '';

        // when
        const error = catchErrSync(() => moduleIssueReportBuilder({ comment: emptyComment }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The comment should not be empty');
      });
    });

    describe('if an issueReport does not have a moduleId', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new ModuleIssueReport({}))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The moduleId is required for a ModuleIssueReport');
      });
    });

    describe('if an issueReport does not have an elementId', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(() => new ModuleIssueReport({ moduleId: '7d2a96d8-b7e3-4b97-acbf-5e51aa892279' }))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The elementId is required for a ModuleIssueReport');
      });
    });

    describe('if an issueReport does not have a passageId', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new ModuleIssueReport({
              moduleId: '7d2a96d8-b7e3-4b97-acbf-5e51aa892279',
              elementId: '0aed9f0d-e735-48f8-900b-32cc4251dd0e',
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The passageId is required for a ModuleIssueReport');
      });
    });

    describe('if an issueReport does not have a categoryKey', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new ModuleIssueReport({
              moduleId: '7d2a96d8-b7e3-4b97-acbf-5e51aa892279',
              elementId: '0aed9f0d-e735-48f8-900b-32cc4251dd0e',
              passageId: '25375',
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The categoryKey is required for a ModuleIssueReport');
      });
    });

    describe('if an issueReport does not have a comment', function () {
      it('should throw an error', function () {
        // when
        const error = catchErrSync(
          () =>
            new ModuleIssueReport({
              moduleId: '7d2a96d8-b7e3-4b97-acbf-5e51aa892279',
              elementId: '0aed9f0d-e735-48f8-900b-32cc4251dd0e',
              passageId: '25375',
              categoryKey: 'categoryKey',
            }),
        )();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The comment is required for a ModuleIssueReport');
      });
    });
  });
});

const moduleIssueReportBuilder = ({ moduleId, elementId, passageId, answer, userAgent, categoryKey, comment } = {}) => {
  return new ModuleIssueReport({
    moduleId: moduleId || '7d2a96d8-b7e3-4b97-acbf-5e51aa892279',
    elementId: elementId || '0aed9f0d-e735-48f8-900b-32cc4251dd0e',
    passageId: passageId || 2571,
    answer: answer || 'ma super réponse',
    userAgent: userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
    categoryKey: categoryKey || "C'est tout cassé",
    comment,
  });
};
