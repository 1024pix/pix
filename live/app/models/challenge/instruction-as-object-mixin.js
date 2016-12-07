import Ember from 'ember';

export default Ember.Mixin.create({
  _instructionAsObject: Ember.computed('instruction', function () {
    return {
      text: this.get('instruction'),
      illustrationUrl: this.get('illustrationUrl'),
      attachmentUrl: this.get('attachmentUrl'),
      attachmentFilename: this.get('attachmentFilename')
    };
  })
});


