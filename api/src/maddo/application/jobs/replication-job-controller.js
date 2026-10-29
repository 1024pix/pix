import { knex as datamartKnex } from '../../../../datamart/knex-database-connection.js';
import { knex as datawarehouseKnex } from '../../../../datawarehouse/knex-database-connection.js';
import { JobController, JobGroup } from '../../../shared/application/jobs/job-controller.js';
import { ReplicationJob } from '../../domain/models/ReplicationJob.js';
import { runReplication } from '../../domain/usecases/run-replication.ts';

export class ReplicationJobController extends JobController {
  constructor() {
    super(ReplicationJob.name, { jobGroup: JobGroup.MADDO });
  }

  async handle({ data: { replicationName }, dependencies = { runReplication, datamartKnex, datawarehouseKnex } }) {
    const { runReplication, datamartKnex, datawarehouseKnex } = dependencies;
    return runReplication({ replicationName, datamartKnex, datawarehouseKnex });
  }
}
