import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ConvertCenterToV3Job } from '../../domain/models/ConvertCenterToV3Job.js';
import { usecases } from '../../domain/usecases/index.js';

export class ConvertCenterToV3JobController extends JobController {
  constructor() {
    super(ConvertCenterToV3Job.name);
  }

  /**
   * @param {Object} params
   * @param {Object} params.data
   * @param {number} params.data.centerId
   */
  async handle({ data }) {
    const { centerId } = data;
    await usecases.deleteUnstartedSessions({ centerId });
    await usecases.registerCenterPilotFeatures({ centerId, isV3Pilot: true });
  }
}
