import Inert from '@hapi/inert';
import Vision from '@hapi/vision';

import { eventLoopWatchdogPlugin } from '../event-loop-watchdog/event-loop-watchdog.ts';
import * as pino from './pino.js';
import * as serverSideCookieSession from './yar.js';

const plugins = [Inert, Vision, pino, serverSideCookieSession, eventLoopWatchdogPlugin];

export { plugins };
