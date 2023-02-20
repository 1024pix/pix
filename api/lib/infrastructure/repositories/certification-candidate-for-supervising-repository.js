import { knex } from '../../../db/knex-database-connection';
import { NotFoundError } from '../../domain/errors';
import CertificationCandidateForSupervising from '../../domain/models/CertificationCandidateForSupervising';

export default {
  async get(certificationCandidateId) {
    const result = await knex('certification-candidates')
      .select(
        'certification-candidates.*',
        'assessments.state AS assessmentStatus',
        'certification-courses.createdAt AS startDateTime'
      )
      .leftJoin('certification-courses', function () {
        this.on('certification-courses.sessionId', '=', 'certification-candidates.sessionId');
        this.on('certification-courses.userId', '=', 'certification-candidates.userId');
      })
      .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .where({ 'certification-candidates.id': certificationCandidateId })
      .first();
    return new CertificationCandidateForSupervising({ ...result });
  },

  async update(certificationCandidateForSupervising) {
    const result = await knex('certification-candidates')
      .where({
        id: certificationCandidateForSupervising.id,
      })
      .update({ authorizedToStart: certificationCandidateForSupervising.authorizedToStart });

    if (result === 0) {
      throw new NotFoundError('Aucun candidat trouvé');
    }
  },
};
