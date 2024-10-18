import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { ConvertScoCenterToV3Job } from '../../domain/models/ConvertScoCenterToV3Job.js';
import { usecases } from '../../domain/usecases/index.js';

export class ConvertScoCenterToV3JobController extends JobController {
  constructor() {
    super(ConvertScoCenterToV3Job.name);
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
