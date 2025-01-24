<script setup lang="ts">
import { type Theme } from './theme';
const { model } = defineProps<{ model: Theme }>();
const emit = defineEmits(['close']);
</script>

<template>
  <div class="theme-view">
    <div class="theme-header-row">
      <h2>theme</h2>
    </div>
    <button class="close-button" @click="emit('close')">&times;</button>

    <div class="theme-grid">

      <div class="theme-header">Light cells:</div>
      <div>r: {{ model.light.r }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.r" />
      <div>g: {{ model.light.g }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.g" />
      <div>b: {{ model.light.b }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.b" />
      <hr class="divider"/>
      <div class="theme-header">Dark cells:</div>
      <div>r: {{ model.dark.r }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.r" />
      <div>g: {{ model.dark.g }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.g" />
      <div>b: {{ model.dark.b }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.b" />

    </div>

    <div class="action-buttons">
      <ui-button class="btn" @click="model.save()">save</ui-button>
      <ui-button class="btn" @click="model.load()">load</ui-button>
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
    </div>
  </div>
</template>

<style lang="scss">
.theme-view {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  min-width: 20em;
  position: relative;
}

.theme-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 1rem;
}

.close-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    color: #333;
  }
}

.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1rem;
  row-gap: 0.5rem;
}

.theme-header {
  grid-column: 1 / -1;
}

.divider {
  grid-column: 1 / -1;
  width: 100%;
  margin: 0.5rem 0;
  border: none;
  border-top: 1px solid rgb(var(--border));
}

.action-buttons {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center
}
</style>
