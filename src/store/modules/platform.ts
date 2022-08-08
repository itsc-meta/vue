import { Platform, EVENT } from '@/utils/platform'
import { defineStore } from 'pinia';

// const platform = new Platform();
/**
 * 模型平台页面
 */
const usePlatform = defineStore({
  id: 'platform',
  state: () => ({
    loadingPercent: 0,
    content: '',
    instance: <{platform:Platform|undefined}>{
      platform:undefined
    }
  }),
  getters: {
    /**
     * 是否加载
     */
    isLoading():boolean {
      return this.loadingPercent !== 1;
    },
    /**
     * 加载信息
     */
    loadingMsg():string {
      return `loading:${Math.floor(this.loadingPercent * 1000) / 10}%`;    
    },
    /**
     * 展位介绍
     */
    boothContent():string {
      return this.content;
    }
  },
  actions: {
    /**
     * 装载canvas
     * @param canvas 
     */
    freight(canvas:HTMLCanvasElement) {
      this.instance.platform = new Platform();
      this.instance.platform.freight(canvas);
      this.instance.platform.addEventListener(EVENT.LOADING, this.onLoading);
      this.instance.platform.addEventListener(EVENT.LOADED, this.onLoaded);
    },
    /**
     * 加载中
     * @param e 
     */
    onLoading(e:any) {
      const { data } = e;
      this.loadingPercent = data.loaded / data.total;
    },
    /**
     * 加载完毕
     * @param e 
     */
    onLoaded(e:any) {
      this.loadingPercent = 1;
    },
    /**
     * 投射射线，用于点击检测
     * @param x 横坐标
     * @param y 纵坐标
     */
    cast(x:number, y:number) {
      const booth = this.instance.platform?.cast(x, y);
      if(booth) {
        this.content = booth.getContent();
      }
    },
    /**
     * 根据config开始
     * @param id config id
     */
    start(id:string) {
      this.instance.platform?.start(id);
    }
  }
});
export default usePlatform;