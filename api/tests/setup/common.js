import 'dayjs/locale/fr.js';

import { use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { featureToggles } from '../../src/shared/infrastructure/feature-toggles/index.js';
import * as customChaiHelpers from '../tooling/chai-custom-helpers/index.js';
import { jobChai } from '../tooling/chai-custom-helpers/jobs/expect-job.js';

// Init Dayjs configuration
dayjs.extend(localizedFormat);

// Extends Chai helpers
chaiUse(chaiAsPromised);
chaiUse(sinonChai);
chaiUse(jobChai);
Object.values(customChaiHelpers).forEach(chaiUse);

export const mochaHooks = {
  async afterEach() {
    sinon.restore();
    await featureToggles.resetDefaults();
  },
};
