import * as createSession from './application/create-session-route.js';
import * as sessionLiveAlert from './application/session-live-alert-route.js';

const certificationSessionRoutes = [createSession, sessionLiveAlert];

export { certificationSessionRoutes };
