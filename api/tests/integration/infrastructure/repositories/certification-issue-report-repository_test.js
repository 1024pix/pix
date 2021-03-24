const _ = require('lodash');
const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const certificationIssueReportRepository = require('../../../../lib/infrastructure/repositories/certification-issue-report-repository');
const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certification Issue Report', function() {

  afterEach(async function() {
    await knex('certification-issue-reports').delete();
  });

  describe('#save', function() {

    it('should persist the certif issue report in db', async function() {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const certificationIssueReport = new CertificationIssueReport({
        certificationCourseId,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        description: 'Un gros problème',
        subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
        questionNumber: 5,
      });
      await databaseBuilder.commit();

      // when
      const savedCertificationIssueReport = await certificationIssueReportRepository.save(certificationIssueReport);

      // then
      const expectedSavedCertificationIssueReport = {
        certificationCourseId,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        description: 'Un gros problème',
        isActionRequired: true,
        subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
        questionNumber: 5,
      };

      expect(_.omit(savedCertificationIssueReport, 'id')).to.deep.equal(expectedSavedCertificationIssueReport);
      expect(savedCertificationIssueReport).to.be.an.instanceOf(CertificationIssueReport);
    });
  });

  describe('#delete', function() {

    it('should delete the issue report when it exists in certification course id', async function() {
      // given
      const certificationIssueReportToDeleteId = databaseBuilder.factory.buildCertificationIssueReport().id;
      databaseBuilder.factory.buildCertificationIssueReport();
      await databaseBuilder.commit();

      // when
      await certificationIssueReportRepository.delete(certificationIssueReportToDeleteId);

      // then
      const exists = await knex('certification-issue-reports').where({ id: certificationIssueReportToDeleteId }).first();
      expect(Boolean(exists)).to.be.false;
    });

    it('should return true when deletion happened', async function() {
      // given
      const certificationIssueReportToDeleteId = databaseBuilder.factory.buildCertificationIssueReport().id;
      await databaseBuilder.commit();

      // when
      const deleted = await certificationIssueReportRepository.delete(certificationIssueReportToDeleteId);

      // then
      expect(deleted).to.be.true;
    });

    it('should return false when there was nothing to delete', async function() {
      // given
      const certificationIssueReportToDeleteId = databaseBuilder.factory.buildCertificationIssueReport().id;

      // when
      const deleted = await certificationIssueReportRepository.delete(certificationIssueReportToDeleteId);

      // then
      expect(deleted).to.be.false;
    });
  });

  describe('#get', function() {
    it('should return a certification issue report', async function() {
      // given
      const issueReport = databaseBuilder.factory.buildCertificationIssueReport({ category: 'OTHER' });
      await databaseBuilder.commit();

      // when
      const result = await certificationIssueReportRepository.get(issueReport.id);

      // then
      const expectedIssueReport = { ...issueReport, isActionRequired: true };
      expect(result).to.deep.equal(expectedIssueReport);
      expect(result).to.be.instanceOf(CertificationIssueReport);
    });

    it('should throw a notFound error', async function() {
      // when
      const error = await catchErr(certificationIssueReportRepository.get)(1234);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

});
