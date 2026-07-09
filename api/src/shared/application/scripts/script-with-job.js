import { JobClient } from '../../infrastructure/jobs/JobClient.js';
import { JobGroup } from '../jobs/job-controller.js';
import { Script } from './script.js';

export class ScriptWithJob extends Script {
  async handle() {
    await JobClient.instance.initialize({
      jobGroups: [JobGroup.DEFAULT],
    });
    this.onFinished = async () => {
      await JobClient.instance.stop();
    };
  }
}
