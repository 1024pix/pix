import { PixIconButton } from '@1024pix/nebulix-ember';
<template>
  <PixIconButton
    aria-label={{@ariaLabel}}
    @iconName="{{if @isOpen 'chevronTop' 'chevronBottom'}}"
    aria-expanded="{{@isOpen}}"
    @triggerAction={{@onClick}}
    @size="small"
    @color="dark-grey"
  />
</template>
