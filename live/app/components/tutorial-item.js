import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames : ['tutorial-item'],

  formatWithImage: ['vidéo', 'son', 'page'],
  tutorial: null,

  displayedDuration: computed('tutorial', function() {
    const durationByTime = this.get('tutorial').duration
      .split(':')
      .map(duration => parseInt(duration));

    if(durationByTime[0]>0) {
      return durationByTime[0] + ' h';
    }
    if(durationByTime[1]>0) {
      return durationByTime[1] + ' min';
    }
    return '1 min';
  }),

  formatImageName: computed('tutorial', function() {
    const format = this.get('tutorial').format;
    if(this.get('formatWithImage').includes(format)) {
      return format;
    } else {
      return 'page';
    }
  })

});
