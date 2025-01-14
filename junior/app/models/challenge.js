/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { computed } from '@ember/object';
import Model, { attr, hasMany } from '@ember-data/model';

export default class Challenge extends Model {
  // attributes
  @attr('string') embedUrl;
  @attr('boolean') autoReply;
  @attr('string') embedTitle;
  @attr('string') embedHeight;
  @attr('string') format;
  @attr('string', {
    defaultValue() {
      return '';
    },
  })
  illustrationAlt;
  @attr('string') illustrationUrl;
  @attr('array', {
    defaultValue() {
      return [];
    },
  })
  instructions;
  @attr('string') proposals;
  @attr('string') type;
  @attr('boolean') focused;
  @attr('boolean') shuffled;
  @attr() webComponentProps;
  @attr('string') webComponentTagName;

  @hasMany('activity-answer', { async: true, inverse: 'challenge' }) activityAnswers;

  @computed('embedHeight', 'embedTitle', 'embedUrl', 'hasWebComponent')
  get hasEmbed() {
    const embedUrl = this.embedUrl;
    return !!embedUrl && !!this.embedTitle && !this.hasWebComponent && embedUrl.toLowerCase().indexOf('https://') === 0; // fixes bug on IE: startsWith in not supported (PR #242)
  }

  get hasWebComponent() {
    return !!this.webComponentProps && !!this.webComponentTagName;
  }

  get isLesson() {
    return !!this.focused;
  }

  get isQROC() {
    return this.autoReply === false && this.type === 'QROC';
  }

  get isQROCM() {
    return this.autoReply === false && (this.type === 'QROCM-dep' || this.type === 'QROCM-ind');
  }

  get isQCU() {
    return this.autoReply === false && this.type === 'QCU';
  }

  get isQCM() {
    return this.autoReply === false && (this.type === 'QCM' || this.type === 'QCMIMG');
  }

  get hasForm() {
    return this.isQROC || this.isQROCM || this.isQCM || this.isQCU;
  }

  get hasType() {
    return !!this.type;
  }

  get hasMedia() {
    return this.illustrationUrl || this.hasEmbed || this.hasWebComponent;
  }
}
