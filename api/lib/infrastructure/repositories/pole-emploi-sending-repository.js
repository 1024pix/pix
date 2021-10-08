const settings = require('../../../lib/config');
const Bookshelf = require('../bookshelf');
const BookshelfPoleEmploiSending = require('../orm-models/PoleEmploiSending');

module.exports = {
  create({ poleEmploiSending }) {
    return new BookshelfPoleEmploiSending(poleEmploiSending).save();
  },

  async find(sending, filters) {
    const POLE_EMPLOI_SENDINGS_LIMIT = settings.poleEmploi.poleEmploiSendingsLimit;
    const IDENTITY_PROVIDER_POLE_EMPLOI = settings.poleEmploi.poleEmploiIdentityProvider;

    const rawSendings = await Bookshelf.knex('pole-emploi-sendings')
      .select(
        'pole-emploi-sendings.id AS idEnvoi',
        'pole-emploi-sendings.createdAt AS dateEnvoi',
        'pole-emploi-sendings.payload AS resultat',
        'authentication-methods.externalIdentifier AS idPoleEmploi'
      )
      .join('campaign-participations', 'campaign-participations.id', 'pole-emploi-sendings.campaignParticipationId')
      .join('authentication-methods', 'authentication-methods.userId', 'campaign-participations.userId')
      .where('authentication-methods.identityProvider', IDENTITY_PROVIDER_POLE_EMPLOI)
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
