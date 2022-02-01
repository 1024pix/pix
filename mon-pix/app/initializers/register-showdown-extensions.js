import showdown from 'showdown';

export function initialize() {
  showdown.extension('remove-paragraph-tags', function () {
    return [
      {
        type: 'html',
        regex: /<\/?p[^>]*>/g,
        replace: '',
      },
    ];
  });
}

export default {
  name: 'register-showdown-extensions',
  initialize,
};
