import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { ScheduleExportMigratedUserKnowledgeElementsJobController } from '../../../../../src/db-history/application/jobs/schedule-export-migrated-user-knowledge-elements-job-controller.js';
import { usecases } from '../../../../../src/db-history/domain/usecases/index.js';

describe('Unit | History-db | Application | Jobs | ScheduleExportMigratedUserKnowledgeElementsJobController', function () {
  const cronConfig = config.features.databaseHistory.scheduleExportMigratedUserKnowledgeElements;

  describe('#isJobEnabled', function () {
    it('should be enabled with a cron', function () {
      sinon.stub(cronConfig, 'cron').value('0 2 * * *');

      const controller = new ScheduleExportMigratedUserKnowledgeElementsJobController();

      expect(controller.isJobEnabled).to.be.true;
      expect(controller.jobCron).to.equal('0 2 * * *');
    });

    it('should be disabled without a cron', function () {
      sinon.stub(cronConfig, 'cron').value(undefined);

      const controller = new ScheduleExportMigratedUserKnowledgeElementsJobController();

      expect(controller.isJobEnabled).to.be.false;
    });
  });

  describe('#handle', function () {
    it('should export the migrated user knowledge elements by pages of the configured size', async function () {
      // given
      sinon.stub(usecases, 'exportMigratedUserKnowledgeElements');
      sinon.stub(config.migratedUserKnowledgeElementsExport, 'batchSize').value(500);
      const controller = new ScheduleExportMigratedUserKnowledgeElementsJobController();

      // when
      await controller.handle();

      // then
      expect(usecases.exportMigratedUserKnowledgeElements).to.have.been.calledOnceWithExactly({ batchSize: 500 });
    });
  });
});
