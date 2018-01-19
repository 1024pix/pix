import { gt } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({

  classNames : ['scoring-panel'],

  assessment: null,

  hasATrophy: gt('assessment.estimatedLevel', 0),
  hasSomePix: gt('assessment.pixScore', 0)
});
