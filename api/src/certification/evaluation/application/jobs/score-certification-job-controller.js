import { JobController, JobTeam } from '../../../../shared/application/jobs/job-controller.js';
import { ScoreCertificationJob } from '../../../configuration/domain/models/ScoreCertificationJob.js';
import { usecases } from '../../domain/usecases/index.js';

export class ScoreCertificationJobController extends JobController {
  constructor() {
    super(ScoreCertificationJob.name, {
      description:
        "Recalcule le score des certifications V3 d'une version de certification dont la configuration de scoring vient d'être enregistrée depuis Pix Admin.",
      team: JobTeam.CERTIFICATION,
    });
  }

  async handle({ data }) {
    const { certificationCourseId } = data;
    await usecases.scoreV3Certification({ certificationCourseId });
  }
}
