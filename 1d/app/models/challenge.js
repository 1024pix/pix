/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, hasMany } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Challenge extends Model {
  // attributes
  @attr('array') attachments;
  @attr('string') embedUrl;
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
  @attr('string') instruction;
  @attr('string') alternativeInstruction;
  @attr('string') proposals;
  @attr('number') timer;
  @attr('string') type;
  @attr('boolean') autoReply;
  @attr('boolean') focused;
  @attr('boolean') shuffled;

  @hasMany('activity-answer', { async: true, inverse: 'challenge' }) activityAnswers;

  @computed('embedUrl', 'embedTitle', 'embedHeight')
  get hasValidEmbedDocument() {
    const embedUrl = this.embedUrl;
    return !!embedUrl && !!this.embedTitle && !!this.embedHeight && embedUrl.toLowerCase().indexOf('https://') === 0; // fixes bug on IE: startsWith in not supported (PR #242)
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
}
