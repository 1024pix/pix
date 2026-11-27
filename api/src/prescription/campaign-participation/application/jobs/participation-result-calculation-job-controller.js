import { JobController, JobTeam } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationResultCalculationJob } from '../../domain/models/ParticipationResultCalculationJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class ParticipationResultCalculationJobController extends JobController {
  constructor() {
    super(ParticipationResultCalculationJob.name, {
      description:
        "Calcule et enregistre les résultats d'une participation à une campagne au moment où le participant envoie ses résultats.",
      team: JobTeam.PRESCRIPTION,
    });
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.saveComputedCampaignParticipationResult({ campaignParticipationId });
  }
}
