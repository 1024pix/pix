import Ember from 'ember';

// The whole component is left untested for 17/11 release.`
// Issue raised https://github.com/sgmap/pix/issues/142

export default Ember.Component.extend({
  didInsertElement: function () {
    Ember.run.scheduleOnce('afterRender', this, function () {

      const $loadEmailButton = $('.load-email-button')[0];
      const $contactForm = $('#contact-form');

      $contactForm.submit(
        /* istanbul ignore next */
        function (e) {
          e.preventDefault();
          $loadEmailButton.textContent = 'Veuillez patienter...';
          let emailValue = $('.load-email-enter').val();
          $.ajax({
            url: 'https://formspree.io/1024pix+formspree@gmail.com',
            method: 'POST',
            data: { email: emailValue },
            dataType: 'json',
            success: function () {
              $loadEmailButton.classList.add('load-email-button-is-active');
              $('.first-page-email-enter').attr('disabled', 'disabled');
              $('button.load-email-button').attr('disabled', 'disabled');
              $loadEmailButton.textContent = 'Rejoindre la communauté';
            },
            error: function () {
              $loadEmailButton.classList.add('load-email-button-is-error');
              setTimeout(function () {
                $('.first-page-email-enter').val('');
                $loadEmailButton.classList.remove('load-email-button-is-error');
                $loadEmailButton.textContent = 'Rejoindre la communauté';
              }, 3000);
            }
          });
        });

    });
  }
});
