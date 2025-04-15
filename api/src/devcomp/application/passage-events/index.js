import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';
import { passageEventsController } from './passage-events-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/passage-events',
      config: {
        auth: false,
        handler: handlerWithDependencies(passageEventsController.create),
        notes: ['- Permet de créer un évènement utilisateur pour un passage'],
        tags: ['api', 'passages', 'modules', 'events'],
      },
    },
  ]);
};

const name = 'passage-events-api';
export { name, register };
