import { prescriberInformationsRoute } from './prescriber-informations.route.js';

const register = async function (server) {
  server.route([...prescriberInformationsRoute]);
};

const name = 'deprecated/prescriber-api';

export const deprecatedRoutes = [{ register, name }];
