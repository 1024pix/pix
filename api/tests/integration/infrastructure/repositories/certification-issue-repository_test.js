const { expect, databaseBuilder, knex } = require('../../../test-helper');
const omit = require('lodash/omit');
const certificationIssueReportRepository = require('../../../../lib/infrastructure/repositories/certification-issue-report-repository');

const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Integration | Repository | Certification Issue Course', function() {

  afterEach(async () => {
    await knex('certification-issue-reports').delete();
  });

  describe('#save', () => {

    it('should persist the certif issue report in db', async () => {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const certificationIssueReport = new CertificationIssueReport({
        certificationCourseId,
        category: CertificationIssueReportCategories.OTHER,
        description: 'Un gros problème',
        subcategory: null,
      });
      await databaseBuilder.commit();

      // when
      const savedCertificationIssueReport = await certificationIssueReportRepository.save(certificationIssueReport);

      // then
      const expectedSavedCertificationIssueReport = {
        certificationCourseId,
        category: CertificationIssueReportCategories.OTHER,
        description: 'Un gros problème',
        subcategory: null,
      };

      expect(omit(savedCertificationIssueReport, 'id')).to.deep.equal(expectedSavedCertificationIssueReport);
      expect(savedCertificationIssueReport).to.be.an.instanceOf(CertificationIssueReport);
    });
  });
});
