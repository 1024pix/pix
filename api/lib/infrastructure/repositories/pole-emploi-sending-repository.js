import { knex } from '../../../db/knex-database-connection';
import settings from '../../../lib/config';
import OidcIdentityProviders from '../../domain/constants/oidc-identity-providers';

export default {
  create({ poleEmploiSending }) {
    return knex('pole-emploi-sendings').insert({ ...poleEmploiSending });
  },

  async find(sending, filters) {
    const POLE_EMPLOI_SENDINGS_LIMIT = settings.poleEmploi.poleEmploiSendingsLimit;

    const rawSendings = await knex('pole-emploi-sendings')
      .select(
        'pole-emploi-sendings.id AS idEnvoi',
        'pole-emploi-sendings.createdAt AS dateEnvoi',
        'pole-emploi-sendings.payload AS resultat',
        'authentication-methods.externalIdentifier AS idPoleEmploi'
      )
      .join('campaign-participations', 'campaign-participations.id', 'pole-emploi-sendings.campaignParticipationId')
      .join('authentication-methods', 'authentication-methods.userId', 'campaign-participations.userId')
      .where('authentication-methods.identityProvider', OidcIdentityProviders.POLE_EMPLOI.service.code)
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
  },
};

function _olderThan(qb, sending) {
  if (sending) {
    qb.where('pole-emploi-sendings.createdAt', '<', sending.dateEnvoi).where(
      'pole-emploi-sendings.id',
      '<',
      sending.idEnvoi
    );
  }
}

function _filterByStatus(qb, filters = {}) {
  if (Object.keys(filters).includes('isSuccessful')) {
    qb.where({ isSuccessful: filters.isSuccessful });
  }
}
