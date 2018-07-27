import Component from '@ember/component';
import { run } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({

  didInsertElement: function() {

    // XXX : we hack here Bootstrap,
    // because we need a display:flex to center the modal
    // since bootstrap insert an inlined-style display:block
    // we have to remove this property once the modal renders.
    run.scheduleOnce('afterRender', this, function() {
      $('#js-modal-mobile').on('shown.bs.modal', function() {
        $('#js-modal-mobile').attr('style', function(i, style) {
          return style.replace(/display[^;]+;?/g, '');
        });
      });
    });
  }

});
