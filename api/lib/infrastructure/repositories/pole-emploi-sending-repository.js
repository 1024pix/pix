import { knex } from '../../../db/knex-database-connection.js';
import { config } from '../../../lib/config.js';
import * as OidcIdentityProviders from '../../domain/constants/oidc-identity-providers.js';

const create = function ({ poleEmploiSending }) {
  return knex('pole-emploi-sendings').insert({ ...poleEmploiSending });
};

const find = async function (sending, filters) {
  const POLE_EMPLOI_SENDINGS_LIMIT = config.poleEmploi.poleEmploiSendingsLimit;

  const rawSendings = await knex('pole-emploi-sendings')
    .select(
      'pole-emploi-sendings.id AS idEnvoi',
      'pole-emploi-sendings.createdAt AS dateEnvoi',
      'pole-emploi-sendings.payload AS resultat',
      'authentication-methods.externalIdentifier AS idPoleEmploi',
    )
    .join('campaign-participations', 'campaign-participations.id', 'pole-emploi-sendings.campaignParticipationId')
    .join('authentication-methods', 'authentication-methods.userId', 'campaign-participations.userId')
    .where('authentication-methods.identityProvider', OidcIdentityProviders.POLE_EMPLOI.code)
    .modify(_olderThan, sending)
    .modify(_filterByStatus, filters)
    .orderBy([
      { column: 'pole-emploi-sendings.createdAt', order: 'desc' },
      { column: 'pole-emploi-sendings.id', order: 'desc' },
    ])
    .limit(POLE_EMPLOI_SENDINGS_LIMIT);

  const sendings = rawSendings.map((rawSending) => {
    const { idPoleEmploi, ...sending } = rawSending;
    sending.resultat.individu['idPoleEmploi'] = idPoleEmploi;
    return sending;
  });

  return sendings;
};

export { create, find };

function _olderThan(qb, sending) {
  if (sending) {
    qb.where('pole-emploi-sendings.createdAt', '<', sending.dateEnvoi).where(
      'pole-emploi-sendings.id',
      '<',
      sending.idEnvoi,
    );
  }
}

function _filterByStatus(qb, filters = {}) {
  if (Object.keys(filters).includes('isSuccessful')) {
    qb.where({ isSuccessful: filters.isSuccessful });
  }
}
