import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: '',

  imageForFormat: {
    'vidéo': 'video',
    'son': 'son',
    'page': 'page'
  },
  tutorial: null,

  displayedDuration: computed('tutorial', function() {
    const durationByTime = this.tutorial.duration
      .split(':')
      .map((duration) => parseInt(duration));

    const HOURS_OF_DURATION = durationByTime[0];
    const MINUTES_OF_DURATION = durationByTime[1];

    if (HOURS_OF_DURATION > 0) {
      return durationByTime[0] + ' h';
    }
    if (MINUTES_OF_DURATION > 0) {
      return durationByTime[1] + ' min';
    }
    return '1 min';
  }),

  formatImageName: computed('tutorial', function() {
    const format = this.tutorial.format;
    if (this.imageForFormat[format]) {
      return this.imageForFormat[format];
    }
    return 'page';
  })

});
