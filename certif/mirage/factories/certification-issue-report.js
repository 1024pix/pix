import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  category() {
    return 'Issue report category';
  },

  subcategory() {
    return 'Issue report sub category';
  },

  description() {
    return 'a not so random description';
  },
});
