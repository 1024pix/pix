import { prescriberInformationsRoute } from './prescriber-informations.route.js';
import { usersMeRoute } from './users-me.route.js';

const register = async function (server) {
  server.route([...prescriberInformationsRoute, ...usersMeRoute]);
};

const name = 'deprecated/deprecated-api';

export const deprecatedRoutes = [{ register, name }];
