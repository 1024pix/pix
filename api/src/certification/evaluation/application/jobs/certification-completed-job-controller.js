import { JobController, JobTeam } from '../../../../shared/application/jobs/job-controller.js';
import { CertificationCompletedJob } from '../../domain/events/CertificationCompleted.js';
import { usecases } from '../../domain/usecases/index.js';

export class CertificationCompletedJobController extends JobController {
  constructor() {
    super(CertificationCompletedJob.name, {
      description:
        "Calcule le score d'une certification V3 dès que le candidat termine son test, pour que son résultat soit disponible sans attendre la publication de la session.",
      team: JobTeam.CERTIFICATION,
    });
  }

  async handle({ data }) {
    const { certificationCourseId, locale } = data;
    await usecases.scoreV3Certification({ certificationCourseId, locale });
  }
}
