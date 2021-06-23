const settings = require('../../../lib/config');
const Bookshelf = require('../bookshelf');
const BookshelfPoleEmploiSending = require('../orm-models/PoleEmploiSending');
const _ = require('lodash');

module.exports = {
  create({ poleEmploiSending }) {
    return new BookshelfPoleEmploiSending(poleEmploiSending).save();
  },

  async get() {
    const POLE_EMPLOI_SENDINGS_LIMIT = require('../../../lib/config').poleEmploi.poleEmploiSendingsLimit;
    const IDENTITY_PROVIDER_POLE_EMPLOI = settings.poleEmploi.poleEmploiIdentityProvider;
    const sendings = [];

    const rawSendings = await Bookshelf.knex('pole-emploi-sendings')
      .select('pole-emploi-sendings.id AS idEnvoi', 'pole-emploi-sendings.createdAt AS dateEnvoi', 'pole-emploi-sendings.payload AS resultat', 'authentication-methods.externalIdentifier AS idPoleEmploi')
      .join('campaign-participations', 'campaign-participations.id', 'pole-emploi-sendings.campaignParticipationId')
      .join('authentication-methods', 'authentication-methods.userId', 'campaign-participations.userId')
      .where('authentication-methods.identityProvider', IDENTITY_PROVIDER_POLE_EMPLOI)
      .orderBy([{ column: 'pole-emploi-sendings.createdAt', order: 'desc' }, { column: 'pole-emploi-sendings.id', order: 'desc' }])
      .limit(POLE_EMPLOI_SENDINGS_LIMIT);

    for (const rawSending of rawSendings) {
      if (rawSending.idPoleEmploi) {
        rawSending.resultat.individu['idPoleEmploi'] = rawSending.idPoleEmploi;
      }
      rawSending.idEnvoi = rawSending.idEnvoi.toString();
      sendings.push(_.omit(rawSending, 'idPoleEmploi'));
    }
    return sendings;
  },
};
