import { JobController, JobTeam } from '../../../../shared/application/jobs/job-controller.js';
import { ParticipationSharedJob } from '../../domain/models/ParticipationSharedJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class ParticipationSharedJobController extends JobController {
  constructor() {
    super(ParticipationSharedJob.name, {
      description:
        "Envoie à France Travail (Pôle emploi) les résultats d'une participation à une campagne lorsque le participant les envoie, si l'organisation est France Travail.",
      team: JobTeam.PRESCRIPTION,
    });
  }

  async handle({ data }) {
    const { campaignParticipationId } = data;

    await usecases.sendSharedParticipationResultsToPoleEmploi({ campaignParticipationId });
  }
}
