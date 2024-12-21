<script setup lang="ts">
import { type App } from './app';

const { model } = defineProps<{ model: App }>();

function keydown(e: KeyboardEvent) {
  if (e.code === 'Escape') {
    model.figureSelector.select('queen');
  }
}
</script>

<template>
  <div class="flex col gap-4">
    <teleport to="body">
      <ui-dialog :model="model.dialog" class="figure-selector-dialog" @keydown="keydown">
        <div class="dlg-panel">
          <div class="flex ai-center px-2">
            <h3>dialog</h3>
            <div class="spacer" />
          </div>
          <div class="dlg-content">
            <figure-selector :model="model.figureSelector" />
          </div>
        </div>
      </ui-dialog>
    </teleport>
    <h1>Workin</h1>
    <div class="flex row ai-center gap-4">
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
      <div>
        turn: {{ model.chess.turn }}
      </div>
    </div>
    <board-view :model="model.board" />
  </div>
</template>

<style lang="scss">
#app {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

$width: 400px;
$height: 150px;
dialog.figure-selector-dialog {
  left: calc((100% - $width) / 2);
  top: 2em;
  width: $width;
  height: $height;
}

.dlg-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  border-radius: var(--radius-large);
  border: 1px solid rgb(var(--border));
  background-color: rgb(var(--surface));
  box-shadow: var(--shadow-large);
  overflow: hidden;
}

.dlg-content {
  position: relative;
  flex: 1 1 auto;
  pointer-events: auto;
  overflow: hidden;
}

.slow-enter-from,
.slow-leave-to {
  opacity: 0;
}
.slow-enter-active,
.slow-leave-active {
  transition: opacity var(--slow);
}

.fast-enter-from,
.fast-leave-to {
  opacity: 0;
}
.fast-enter-active,
.fast-leave-active {
  transition: opacity var(--fast);
}

.delayed-enter-from,
.delayed-leave-to {
  opacity: 0;
}
.delayed-enter-active {
  transition: opacity var(--fast) calc(var(--slow) - var(--fast));
}
.delayed-leave-active {
  transition: opacity var(--fast);
}
</style>
