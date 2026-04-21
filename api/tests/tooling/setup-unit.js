import 'dayjs/locale/fr.js';

import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import * as customChaiHelpers from './chai-custom-helpers/index.js';

// Init Dayjs configuration
dayjs.extend(localizedFormat);

// Extends Chai helpers
use(chaiAsPromised);
use(sinonChai);
Object.values(customChaiHelpers).forEach(use);

// Setup expect globally
global.expect = expect;

export async function mochaGlobalSetup() {
  nock.disableNetConnect();
  nock.enableNetConnect('localhost:9090'); // Unmock S3 storage
}

export const mochaHooks = {
  async afterEach() {
    sinon.restore();
    nock.cleanAll();
  },
};
