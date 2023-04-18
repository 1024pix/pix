import { Factory, trait } from 'miragejs';
import { createLearningContent } from '../helpers/create-learning-content';

export default Factory.extend({
  name() {
    return 'Mon Super Profil Cible Trop Biengggg';
  },

  isPublic() {
    return true;
  },

  createdAt() {
    return new Date('2020-01-01');
  },

  imageUrl() {
    return 'mon_image.png';
  },

  outdated() {
    return false;
  },

  description() {
    return 'Ma Super Description';
  },

  comment() {
    return 'Mon Super Commentaire';
  },

  ownerOrganizationId() {
    return '66';
  },

  category() {
    return 'OTHER';
  },

  isSimplifiedAccess() {
    return false;
  },

  maxLevel() {
    return 1000;
  },

  afterCreate(targetProfile, server) {
    if (targetProfile.areas.models.length === 0) {
      const tubeTrois = server.create('tube', {
        id: 'tubeNiveauTrois',
        name: '@tubeNiveauTrois',
        practicalTitle: 'Mon tube de niveau trois',
        practicalDescription: 'Un tube très intéressant de niveau trois',
        mobile: true,
        tablet: false,
        level: 3,
      });
      const tubeQuatre = server.create('tube', {
        id: 'tubeNiveauQuatre',
        name: '@tubeNiveauQuatre',
        practicalTitle: 'Mon tube de niveau quatre',
        practicalDescription: 'Un tube très intéressant de niveau quatre',
        mobile: false,
        tablet: true,
        level: 4,
      });
      const tubeDeux = server.create('tube', {
        id: 'tubeNiveauDeux',
        name: '@tubeNiveauDeux',
        practicalTitle: 'Mon tube de niveau deux',
        mobile: false,
        tablet: false,
        level: 2,
      });
      const thematicUn = server.create('thematic', {
        id: 'thematicUn',
        index: '1',
        name: 'thematicUn',
        tubes: [tubeTrois, tubeQuatre, tubeDeux],
      });
      const competenceUn = server.create('competence', {
        id: 'competenceUn',
        name: 'competenceUn',
        index: '1.1',
        thematics: [thematicUn],
      });
      const areaUn = server.create('area', {
        id: 'areaUn',
        title: 'areaUn',
        code: '1',
        color: 'blue',
        frameworkId: 'frameworkId',
        competences: [competenceUn],
      });
      targetProfile.update({ areas: [areaUn] });
    }
  },

  withFramework: trait({
    afterCreate(training, server) {
      createLearningContent(server);
    },
  }),
});
