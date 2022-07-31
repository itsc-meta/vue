<template>
  <div class="platform">
    <div v-if="isLoading" class="msg">{{loadingMsg}}</div>
    <canvas ref="canvas" width="500" height="500" style="width:100%" @click="onCast"></canvas>
    <div class="dialog">
      <div class="dialog-content">{{boothContent}}</div>
      <div class="dialog-secretary">
        <img src="@/assets/images/secretary.png" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { usePlatform } from '@/store';
import { computed, onMounted, ref, watch } from 'vue';
const props = defineProps({
  id: String
});
const store = usePlatform();
const canvas = ref<HTMLCanvasElement>();
function onCast(e:MouseEvent) {
  const x = ( e.clientX / window.innerWidth ) * 2 - 1;
	const y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  store.cast(x, y);
}
const isLoading = computed(() => store.isLoading);
const loadingMsg = computed(() => store.loadingMsg);
const boothContent = computed(() => store.boothContent);

onMounted(() => {
  if(canvas.value) {
    store.freight(canvas.value); // 装载canvas
    store.start(props.id||''); // 按照config开始执行
  }
});
watch(() => props.id, (val, old) => {
  store.start(val||''); // config修改
});
</script>

<style scoped lang="scss">
.platform {
  .msg {
    background-color: white;
    position: fixed;
  }
  .dialog {
    position: fixed;
    right: 0;
    bottom: 0;
    background-color: rgba($color: #000000, $alpha: 0.1);
    display: flex;
    flex-direction: row;
    &-content {
      padding: 1em;
      color: #FFF;
    }
  }
}

</style>