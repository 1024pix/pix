import { Factory, trait } from 'miragejs';

export default Factory.extend({
  withCompetences: trait({
    title: 'Mon super domaine',

    afterCreate(area, server) {
      server.schema.create('competence', { name: 'Ma superbe compétence', area });
    },
  }),
});
