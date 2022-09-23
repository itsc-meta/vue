import { IModel } from '@/type/base';
import { Platform, EVENT } from '@/utils/platform'
import { EthVisitor } from '@/utils/platform/eth-visitor';
import { defineStore } from 'pinia';
import axios from 'axios';

// const platform = new Platform();
/**
 * 模型平台页面
 */
const usePlatform = defineStore({
  id: 'platform',
  state: () => ({
    loadingPercent: 0,
    loaded: false,
    errorMsg: '',
    info: <IModel>({}),
    fold: false,
    instance: <{platform:Platform|undefined, visitor:EthVisitor|undefined}>{
      platform:undefined,
      visitor:undefined
    }
  }),
  getters: {
    /**
     * 是否加载
     */
    isLoading():boolean {
      return !this.loaded;
    },
    /**
     * 加载信息
     */
    loadingMsg():string {
      return this.loadingPercent == 1?'模型解压中' : `loading:${Math.floor(this.loadingPercent * 1000) / 10}%`;    
    },
    /**
     * 是否折叠
     */
    isFold():boolean {
      return this.fold;
    },
    /**
     * 展位介绍
     */
    boothInfo():IModel {
      return this.info;
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
      this.instance.visitor = new EthVisitor()
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
      this.loaded = true;
    },
    /**
     * 投射射线，用于点击检测
     * @param x 横坐标
     * @param y 纵坐标
     */
    cast(x:number, y:number) {
      const booth = this.instance.platform?.cast(x, y);
      if(booth) {
        this.info = booth.getInfo();
      }
    },
    /**
     * 切换折叠状态
     */
    toggleFold() {
      this.fold = !this.fold;
    },
    /**
     * 根据config开始
     * @param id config id
     */
    start(id:string) {
      axios.get(`https://minio.trvqd.com/meta/${id}.json`)
      .then((response) => {
        this.instance.platform?.start(response.data);
        this.info = response.data.base;
      })
      .catch((error) => {
        this.errorMsg = error;
      }); 
    }
  }
});
export default usePlatform;