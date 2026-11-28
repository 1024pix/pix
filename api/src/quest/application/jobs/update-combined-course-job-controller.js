import { config } from '../../../../config/config.js';
import { JobController, JobTeam } from '../../../shared/application/jobs/job-controller.js';
import { UpdateCombineCourseJob } from '../../domain/models/combined-course-participations/events/UpdateCombinedCourseJob.js';
import { usecases } from '../../domain/usecases/index.js';

class UpdateCombinedCourseJobController extends JobController {
  constructor() {
    super(UpdateCombineCourseJob.name, {
      description:
        "Met à jour la progression des parcours combinés d'un utilisateur lorsqu'il termine un passage de module Modulix.",
      team: JobTeam.COMBINIX,
    });
  }

  get isJobEnabled() {
    return config.pgBoss.updateCombinedCourseJobEnabled;
  }

  async handle({ data }) {
    const { userId, moduleId } = data;

    // TODO + déplacer les fichiers de test des job controller et repository
    const combinedCourses = await usecases.findCombinedCourseByModuleIdAndUserId({ moduleId, userId });
    for (const combinedCourse of combinedCourses) {
      await usecases.updateCombinedCourseProgress({ userId, code: combinedCourse.code });
    }
  }
}

export { UpdateCombinedCourseJobController };
