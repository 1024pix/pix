import ENV from 'pix-live/config/environment';

export function initialize(/* application */) {
  // XXX : Small hack, huge reward : we can now assert in tests what is the content of outgoing requests.
  if (ENV.environment === 'test') {
    $( document ).ajaxComplete(function(event, xhr, settings) {
      if ('POST' === settings.type) {
        $('.last-post-request').remove();
        $('body').append('<div class="last-post-request"></div>');
        $('.last-post-request').append(`<div class="last-post-request-url">${settings.url}</div>`);
        $('.last-post-request').append(`<div class="last-post-request-body">${settings.data}</div>`);
      }
    });
  }
}

export default {
  name: 'ajax-interceptor',
  initialize
};
