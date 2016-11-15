import Ember from 'ember';

// The whole component is left untested for 17/11 release.`
// Issue raised https://github.com/sgmap/pix-live/issues/142

export default Ember.Component.extend({  
  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {


      let btn = $('.load-email')[0];
      let $contactForm = $('#contact-form');
      
      $contactForm.submit(
        /* istanbul ignore next */
        function(e) {
        e.preventDefault();
        btn.textContent = 'Veuillez patienter...';
        let emailValue = $('.first-page-email-enter').val();
        $.ajax({
          url: 'https://formspree.io/1024pix@gmail.com',
          method: 'POST',
          data: {email:emailValue},
          dataType: 'json',
          success: function(data) {
            btn.classList.add('load-email-is-active');
            $('.first-page-email-enter').attr('disabled', 'disabled');
            $('button.load-email').attr('disabled', 'disabled');
            btn.textContent = 'Rejoindre la communauté';
          },
          error: function() {
            btn.classList.add('load-email-is-error');
            setTimeout(function () {
              $('.first-page-email-enter').val('');
              btn.classList.remove('load-email-is-error');
              btn.textContent = 'Rejoindre la communauté';
            }, 3000);
          }
        });
      });


    });
  }
});
