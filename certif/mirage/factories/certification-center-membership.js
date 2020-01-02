import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({

  certificationCenter: association(),

  user: association(),
});
