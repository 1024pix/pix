import { JobClient } from '../../infrastructure/jobs/JobClient.js';
import { JobGroup } from '../jobs/job-controller.js';
import { Script } from './script.js';

export class ScriptWithJob extends Script {
  async handle({ jobClient = JobClient.instance } = {}) {
    await jobClient.initialize({
      jobGroups: [JobGroup.DEFAULT],
    });
    this.onFinished = async () => {
      await jobClient.stop();
    };
  }
}
