import { knex as datamartKnex } from '../../../../datamart/knex-database-connection.js';
import { knex as datawarehouseKnex } from '../../../../datawarehouse/knex-database-connection.js';
import { JobController, JobGroup, JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { ReplicationJob } from '../../domain/models/ReplicationJob.js';
import { runReplication } from '../../domain/usecases/run-replication.ts';

export class ReplicationJobController extends JobController {
  constructor() {
    super(ReplicationJob.name, {
      description:
        "Exécute, à la demande de l'API Maddo, une réplication nommée de données de l'entrepôt (datawarehouse) vers le datamart. Tourne sur le worker du groupe maddo.",
      team: JobTeam.ACCES,
      jobGroup: JobGroup.MADDO,
    });
  }

  async handle({ data: { replicationName }, dependencies = { runReplication, datamartKnex, datawarehouseKnex } }) {
    const { runReplication, datamartKnex, datawarehouseKnex } = dependencies;
    return runReplication({ replicationName, datamartKnex, datawarehouseKnex });
  }
}
