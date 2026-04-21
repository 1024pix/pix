import { ModuleIssueReport } from '../../../../src/devcomp/domain/models/module/ModuleIssueReport.js';
import * as moduleIssueReportRepository from '../../../../src/devcomp/infrastructure/repositories/module-issue-report-repository.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('Integration | DevComp | Repositories | ModuleIssueReportRepository', function () {
  describe('#save', function () {
    it('should save a module issue report', async function () {
      // given
      const passage = databaseBuilder.factory.buildPassage();
      await databaseBuilder.commit();

      const moduleId = '7d2a96d8-b7e3-4b97-acbf-5e51aa892279';
      const elementId = '0aed9f0d-e735-48f8-900b-32cc4251dd0e';
      const passageId = passage.id;
      const answer = 'ma super réponse';
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0';
      const categoryKey = "C'est tout cassé";
      const comment = "C'est tout cassé";

      // when
      const issueReport = new ModuleIssueReport({
        moduleId,
        elementId,
        passageId,
        answer,
        userAgent,
        categoryKey,
        comment,
      });

      // when
      const id = await moduleIssueReportRepository.save(issueReport);

      // then
      const moduleIssueReportDb = await knex.select('*').from('module_issue_reports').first();

      expect(moduleIssueReportDb.id).to.equal(id);
      expect(moduleIssueReportDb.moduleId).to.equal(moduleId);
      expect(moduleIssueReportDb.elementId).to.equal(elementId);
      expect(moduleIssueReportDb.passageId).to.equal(passage.id);
      expect(moduleIssueReportDb.answer).to.equal(answer);
      expect(moduleIssueReportDb.userAgent).to.equal(userAgent);
      expect(moduleIssueReportDb.categoryKey).to.equal(categoryKey);
      expect(moduleIssueReportDb.comment).to.equal(comment);
      expect(moduleIssueReportDb.createdAt).to.exist;
    });
  });
});
