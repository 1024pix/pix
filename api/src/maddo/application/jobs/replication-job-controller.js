import { knex as datamartKnex } from '../../../../datamart/knex-database-connection.js';
import { knex as datawarehouseKnex } from '../../../../datawarehouse/knex-database-connection.js';
import { JobController, JobGroup } from '../../../shared/application/jobs/job-controller.js';
import { ReplicationJob } from '../../domain/models/ReplicationJob.js';
import { extractTransformAndLoadData } from '../../domain/usecases/extract-transform-and-load-data.ts';

export class ReplicationJobController extends JobController {
  constructor() {
    super(ReplicationJob.name, { jobGroup: JobGroup.MADDO });
  }

  async handle({
    data: { replicationName },
    dependencies = { extractTransformAndLoadData, datamartKnex, datawarehouseKnex },
  }) {
    const { extractTransformAndLoadData, datamartKnex, datawarehouseKnex } = dependencies;
    return extractTransformAndLoadData({ replicationName, datamartKnex, datawarehouseKnex });
  }
}
