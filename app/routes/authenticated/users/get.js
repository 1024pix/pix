import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  model(params) {
    //return this.get('store').findRecord('user', params.user_id);
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'jdoe@mail.com',
      profileAreas: [
        {
          name: 'Informations et données',
          profileCompetences: [{
            name: '1.1. Mener une recherche et une veille d’information',
            level: '2'
          }, {
            name: '1.2. Gérer des données',
            level: '3'
          }, {
            name: '1.3. Traiter des données',
            level: '3'
          }]
        },
        {
          name: 'Communication et collaboration',
          profileCompetences: [{
            name: '2.1. Interagir',
            level: '4'
          }, {
            name: '2.2. Partager et publier',
            level: '3'
          }, {
            name: '2.3. Collaborer',
            level: '4'
          }, {
            name: '2.4. S’insérer dans le monde numérique',
            level: '2'
          }]
        },
        {
          name: 'Création de contenu',
          profileCompetences: [{
            name: '3.1. Développer des documents textuels\n',
          }, {
            name: '3.2. Développer des documents multimédia',
          }, {
            name: '3.3. Adapter les documents à leur finalité',
          }, {
            name: '3.4. Programmer',
          }]
        },
        {
          name: 'Protection et sécurité',
          profileCompetences: [{
            name: '4.1. Sécuriser l’environnement numérique',
            level: '4'
          }, {
            name: '4.2. Protéger les données personnelles et la vie privée',
            level: '5'
          }, {
            name: '4.3. Protéger la santé, le bien-être et l’environnement',
            level: '5'
          }]
        },
        {
          name: 'Environnement numérique',
          profileCompetences: [{
            name: '5.1 Résoudre des problèmes techniques',
            level: '1'
          }, {
            name: '5.2 Construire un environnement numérique',
            level: '0'
          }]
        }],
      placementTests: [
        {
          id: 30567,
          competenceIndex: '1.1',
          status: 'COMPLETED',
          level: 2.5,
          nbPix: 20,
          startDate: '2018-01-20 11:30:00',
          endDate: '2018-01-20 11:55:00',
          answers: [
            {
              challengeRef: 'recAbcd1234',
              value: 'foo',
              outcome: 'OK'
            },
            {
              challengeRef: 'recEfgh5678',
              value: 'bar',
              outcome: 'KO'
            }
          ]
        },
        {
          id: 48701,
          competenceIndex: '3.2',
          status: 'PENDING',
          startDate: '2018-01-20 11:30:00'
        }

      ],
      campaigns: [],
      certifications: []
    };
  }
});







