<script setup lang="ts">
import type { Picker } from './picker';
import type { Type } from './types';

const { model } = defineProps<{ model: Picker }>();

const types: Type[] = ['rook', 'knight', 'bishop', 'queen'];
</script>

<template>
  <div class="figure-selector" :style="{ visibility: model.show ? 'visible' : 'hidden' }">
    <ui-button v-for="(item, index) in model.images" :key="index" class="figure-button" @click="model.select(types[index])">
      <ui-item class="figure" :model="item" />
    </ui-button>
  </div>
</template>

<style lang="scss">
.figure-selector {
  display: flex;
  box-shadow: var(--shadow-large);
  z-index: var(--z-dlg);
}
.figure-button {
  width: var(--base);
  height: var(--base);
  position: relative;
}
.figure {
  position: absolute;
  inset: 0;
}
</style>
