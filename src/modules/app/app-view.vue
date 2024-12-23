<script setup lang="ts">
import { type App } from './app';

const { model } = defineProps<{ model: App }>();

function escape(e: KeyboardEvent) {
  if (e.code === 'Escape') {
    model.ok();
  }
}

// const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
// const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
</script>

<template>
  <div class="flex col gap-4">
    <teleport to="body">
      <ui-dialog :model="model.dialog" class="win-dialog" @keydown="escape">
        <div class="dlg-panel">
          <h2>{{ model.chess.turn }} win!</h2>
          <ui-button class="btn" @click="model.ok()">ok</ui-button>
        </div>
      </ui-dialog>
    </teleport>
    <div class="header">
      <h2>{{ model.chess.turn }} turn</h2>
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
    </div>
    <div class="chess-wrapper">
      <board-view :model="model.board" />
    </div>
  </div>
</template>

<style lang="scss">
#app {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  --base: min(8vw, 8vh);
}

.chess-wrapper {
  width: calc(var(--base) * 9);
  height: calc(var(--base) * 10);
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid rgb(var(--border));
}

$width: 400px;
$height: 150px;
dialog.win-dialog {
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
  gap: 1em;
  align-items: center;
  justify-content: center;
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
