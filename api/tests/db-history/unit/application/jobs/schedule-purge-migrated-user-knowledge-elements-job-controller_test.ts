import { expect } from 'chai';
import sinon from 'sinon';

import { config } from '../../../../../config/config.js';
import { SchedulePurgeMigratedUserKnowledgeElementsJobController } from '../../../../../src/db-history/application/jobs/schedule-purge-migrated-user-knowledge-elements-job-controller.ts';
import { usecases } from '../../../../../src/db-history/domain/usecases/index.js';

describe('Unit | History-db | Application | Jobs | SchedulePurgeMigratedUserKnowledgeElementsJobController', function () {
  const cronConfig = config.features.databaseHistory.schedulePurgeMigratedUserKnowledgeElements;

  describe('#isJobEnabled', function () {
    it('should be enabled with a cron', function () {
      sinon.stub(cronConfig, 'cron').value('0 4 * * *');

      const controller = new SchedulePurgeMigratedUserKnowledgeElementsJobController();

      expect(controller.isJobEnabled).to.equal(true);
      expect(controller.jobCron).to.equal('0 4 * * *');
    });

    it('should be disabled without a cron', function () {
      sinon.stub(cronConfig, 'cron').value(undefined);

      const controller = new SchedulePurgeMigratedUserKnowledgeElementsJobController();

      expect(controller.isJobEnabled).to.equal(false);
    });
  });

  describe('#handle', function () {
    it('should call the usecase with the configured retention and batch size', async function () {
      // given
      sinon.stub(usecases, 'purgeExportedMigratedUserKnowledgeElements');
      sinon.stub(config.migratedUserKnowledgeElementsPurge, 'retentionDays').value(14);
      sinon.stub(config.migratedUserKnowledgeElementsPurge, 'batchSize').value(500);
      const controller = new SchedulePurgeMigratedUserKnowledgeElementsJobController();

      // when
      await controller.handle();

      // then
      expect(usecases.purgeExportedMigratedUserKnowledgeElements).to.have.been.calledOnceWithExactly({
        retentionDays: 14,
        batchSize: 500,
      });
    });
  });
});
