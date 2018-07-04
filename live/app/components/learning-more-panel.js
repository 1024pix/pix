import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['learning-more-panel'],

  learningMoreList: null,

  hasLearningMoreItems: computed('learningMoreList', function() {
    return this.get('learningMoreList.length') > 0;
  }),
});
