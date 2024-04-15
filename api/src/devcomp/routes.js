import * as modulesRoutes from './application/modules/index.js';
import * as passages from './application/passages/index.js';
import * as trainings from './application/trainings/index.js';
import * as userTutorials from './application/user-tutorials/index.js';

const devcompRoutes = [modulesRoutes, passages, trainings, userTutorials];

export { devcompRoutes };
