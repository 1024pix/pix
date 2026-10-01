import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import SafeMarkdownToHtml from 'pix-orga/components/safe-markdown-to-html';

<template>
  <PixNotificationAlert @type="communication-orga" @withIcon={{true}}>
    <SafeMarkdownToHtml @markdown={{@content}} class="sco-banner__content" />
  </PixNotificationAlert>
</template>
