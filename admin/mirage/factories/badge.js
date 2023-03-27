import { Factory } from 'miragejs';

export default Factory.extend({
  key() {
    return 'BADGE_KEY';
  },

  title() {
    return 'Titre de mon badge';
  },

  message() {
    return 'Message de mon badge';
  },

  imageUrl() {
    return 'https://images.pix.fr/badges/mon_badge_qui_nexiste_probablement_pas.png';
  },

  altMessage() {
    return 'Alt message de mon badge';
  },

  isCertifiable() {
    return false;
  },

  isAlwaysVisible() {
    return false;
  },

  criteria() {
    return [];
  },

  afterCreate(badge, server) {
    if (badge.criteria.models.length === 0) {
      const criteriaCampaign = server.create('badge-criterion', {
        scope: 'CampaignParticipation',
        threshold: 50,
      });
      badge.update({
        criteria: [criteriaCampaign],
        imageUrl: `https://images.pix.fr/badges/${badge.imageUrl}`,
      });
    }
  },
});
