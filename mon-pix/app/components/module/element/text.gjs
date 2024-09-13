import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

<template>
  <div class="element-text">
    {{htmlUnsafe @text.content}}
  </div>
</template>
