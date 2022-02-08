<script lang="ts" setup>
// import { check } from 'checker';

import { ref } from 'vue';

const imagePath = ref(null as string | null);

const dragEnter = (e: any) => {
  console.log('dragenter');
  console.log(e);
};

const dragLeave = (e: any) => {
  console.log('dragleave');
  console.log(e);
};

const drop = async (e: DragEvent) => {
  const file = e.dataTransfer?.files[0] as any;
  const base64 = 'data:image/png;base64,' + (await window.electron.check(file.path, 6));
  console.log('drop');
  imagePath.value = base64;
};
const dragOver = () => {
  console.log();
};
</script>

<template>
  <div
    class="absolute z-10 w-screen h-screen bg-transparent"
    @dragenter.prevent="dragEnter"
    @dragover.prevent="dragOver"
    @dragleave.prevent="dragLeave"
    @drop.prevent="drop"
  >
    <div v-if="!imagePath">
      画像をドラッグしてください
    </div>
  </div>
  <img
    :src="imagePath!"
    style="max-width: auto"
  >
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
fieldset {
  margin: 2rem;
  padding: 1rem;
}
img {
  max-width: auto !important;
}
</style>
