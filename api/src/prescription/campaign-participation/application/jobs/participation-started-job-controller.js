import { JobController, JobTeam } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationStartedJob } from '../../domain/models/ParticipationStartedJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class ParticipationStartedJobController extends JobController {
  constructor() {
    super(ParticipationStartedJob.name, {
      description:
        "Notifie France Travail (Pôle emploi) du démarrage d'une participation à une campagne, si l'organisation est France Travail.",
      team: JobTeam.PRESCRIPTION,
    });
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.sendStartedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
