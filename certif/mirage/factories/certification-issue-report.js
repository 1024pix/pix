import { Factory } from 'miragejs';

export default Factory.extend({
  category() {
    return 'CANDIDATE_INFORMATIONS_CHANGES';
  },

  subcategory() {
    return 'Issue report sub category';
  },

  description() {
    return 'a not so random description';
  },
});
