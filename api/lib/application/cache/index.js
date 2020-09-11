const Joi = require('@hapi/joi');
const securityPreHandlers = require('../security-pre-handlers');
const CacheController = require('./cache-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'DELETE',
      path: '/api/cache/{cachekey}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            cachekey: Joi.string().regex(/^(.)+_rec[a-zA-Z0-9]+/).required(),
          }),
        },
        handler: CacheController.refreshCacheEntry,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de supprimer une entrée du cache de l’application\n' +
          'La clé de cache doit avoir la forme {table}_{id}, par exemple Epreuves_recABCDEF\n' +
          'Attention : pour un état cohérent des objets stockés en cache, utiliser PATCH /api/cache',
        ],
      },
    }, {
      method: 'PATCH',
      path: '/api/cache',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: CacheController.refreshCacheEntries,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de précharger les entrées du cache de l’application (les requêtes les plus longues)',
        ],
      },
    },
  ]);
};

exports.name = 'cache-api';
