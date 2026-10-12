import { setTimeout } from 'node:timers/promises';

import { JobController } from '../../jobs/job-controller.js';

export class ExperimentJobController extends JobController {
  constructor() {
    super('ExperimentJob');
  }

  async handle({ data }) {
    console.log(data);
    for (let i = 0; i < 10; i++) {
      await setTimeout(1000);
    }
    if (data.error) {
      throw new Error('Boom !');
    }
    return {
      resultat: 'La Base Virale VPS a Été Mise a Jour',
      meta: 'some meta',
    };
  }
}
