<script setup lang="ts">
import type { Picker } from './picker';
import type { Color, Type } from './types';

const { model, color } = defineProps<{ model: Picker; color: Color }>();

const types: Type[] = ['rook', 'knight', 'bishop', 'queen'];
</script>

<template>
  <div class="picker" :style="{ visibility: model.show && model.color === color ? 'visible' : 'hidden' }">
    <ui-button v-for="(item, index) in model.figures" :key="index" class="picker-button" @click="model.select(types[index])">
      <ui-item class="figure" :model="item" />
    </ui-button>
  </div>
</template>

<style lang="scss">
.picker {
  display: flex;
  // box-shadow: var(--shadow-large);
  z-index: var(--z-dlg);
}
.picker-button {
  width: var(--base);
  height: var(--base);
  position: relative;
}
.figure {
  position: absolute;
  inset: 0;
}
</style>
