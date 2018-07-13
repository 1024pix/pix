import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['learning-more-panel'],

  learningMoreTutorials: null,

  hasLearningMoreItems: computed('learningMoreTutorials.length', function() {
    return this.get('learningMoreTutorials.length') > 0;
  }),
});
