import { htmlSafe } from '@ember/template';
import showdown from 'showdown';
import xss from 'xss';

const xssWhitelist = {
  ...xss.whiteList,
  style: [],
  span: ['style'],
  th: ['style'],
  td: ['style'],
  tr: ['style'],
  table: ['style'],
  a: ['href', 'rel', 'target', 'title'],
};

const showdownOptions = {
  openLinksInNewWindow: true,
  strikethrough: true,
};

export function toHtml(markdown) {
  const converter = new showdown.Converter(showdownOptions);
  const unsafeHtml = converter.makeHtml(markdown);
  const html = xss(unsafeHtml, {
    whiteList: xssWhitelist,
  });
  return htmlSafe(html);
}

<template>
  <div class={{@class}} ...attributes>
    {{toHtml @markdown}}
  </div>
</template>
