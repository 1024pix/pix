import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { JobPgBoss } from '../../../../../shared/infrastructure/jobs/JobPgBoss.js';
import { CampaignParticipationCompletedJob } from '../../../domain/models/CampaignParticipationCompletedJob.js';

class CampaignParticipationCompletedJobRepository extends JobPgBoss {
  constructor() {
    super(
      {
        name: CampaignParticipationCompletedJob.name,
        retryLimit: 10,
        retryDelay: 30,
        retryBackoff: true,
      },
      DomainTransaction.getConnection(),
    );
  }
}

export const campaignParticipationCompletedJobRepository = new CampaignParticipationCompletedJobRepository();
