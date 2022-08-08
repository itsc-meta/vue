import {
  WebGLRenderer, EventDispatcher, PerspectiveCamera,TextureLoader, Scene, Event, Object3D, AnimationMixer,
  sRGBEncoding, PCFSoftShadowMap,
  BackSide, Mesh, Group, Vector3, PointLight, AmbientLight, Color, DynamicDrawUsage, RepeatWrapping, Clock, FogExp2, MathUtils, Raycaster, PlaneGeometry, VideoTexture, MeshBasicMaterial, DirectionalLight
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN, { Tween, Easing } from '@tweenjs/tween.js';
import { IConfig } from '@/type/base';
import { GlbLoader, LOAD_EVENT } from './GlbLoader';
import axios from 'axios';

/**
 * 版本
 */
export const VER = '1.0';
/**
* 事件
*/
export const EVENT = {
   RUNNING: 'running',
   GAME_INIT: 'gameInit',
   GAME_START: 'gameStart',
   LOADING: 'modelLoading',
   LOADED: 'modelLoaded',
   LOAD_FAIL: 'modelLoadFail',
   GAME_OVER: 'gameOver'
};
const Static = {
  X: 0,
  Y: 0,
  WIDTH: 0,
  HEIGHT: 0,
  DURATION: 1600,
  CAMERA_FAR: 50
};

export class Platform extends EventDispatcher {
  _canvas:any = null;
  __camera:PerspectiveCamera; // 摄像头
  __scene:Scene; // 场景
  // __obj; //
  __bg:Group; //背景
  __boothes:Group; // 展位
  __renderer:any = null; // 渲染器
  _loader:any = null; // 加载器
  _controls:any = null; // 控制器
  _config:any;// 配置信息
  _raycaster:Raycaster;// 射线
  _mixers:AnimationMixer[] = []; // 动画
  _clock = new Clock();

  constructor() {
    super();
    this.__scene = new Scene();
    this.__scene.background = new Color(0xaaccff);
    this.__scene.fog = new FogExp2( 0xaaccff, 0.0007 );
    this.__camera = new PerspectiveCamera(75, Static.WIDTH / Static.HEIGHT, 1, 10000);
    const light = new PointLight(0xffffff, 1);
    light.castShadow = true;
    // this.__camera.add(light);
    this._raycaster = new Raycaster();
    this.__bg = new Group();
    this.__boothes = new Group();
    this.__scene.add(
      this.__bg,
      this.__boothes,
      this.getLights(),
      this.__camera
    );
  }
  /**
   * 装载
   * @param canvas 元素
   */
  freight(canvas:HTMLCanvasElement) {
    this._canvas = canvas;
    this.__renderer = new WebGLRenderer({ canvas, antialias: true });
    this.__renderer.outputEncoding = sRGBEncoding;
		// this.__renderer.shadowMap.enabled = true;
    // this.__renderer.shadowMap.type = PCFSoftShadowMap;
    window.addEventListener('resize', this.onResize);
    this.onResize();
    this.animate(0);
  }
  /**
   * 尺寸重置
   */
  onResize = () => {
    Static.X = this._canvas?.offsetLeft;
    Static.Y = this._canvas?.offsetTop;
    if(this._canvas) {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;        
    }
    Static.WIDTH = window.innerWidth;
    Static.HEIGHT = window.innerHeight;
    if(this.__camera) {
      this.__camera.aspect = Static.WIDTH / Static.HEIGHT;
      this.__camera.updateProjectionMatrix();
      this.__renderer.setSize( Static.WIDTH, Static.HEIGHT );
    }
  }
  /**
   * 准备动画
   */
  ready() {
    this.__camera.position.set(0, 200, 0);
    this.__camera.lookAt(new Vector3(0,0,0));
    const t = new Tween(this.__camera.position).to(new Vector3(0,40,40), Static.DURATION);
    t.onUpdate((e) => {
      this.__camera.lookAt(new Vector3(0,0,0));
    });
    t.onComplete(() => {
      this.boothInit();
    })
    t.start();
  }
  /**
   * 开始
   */
  start(id:string) {
    this.onResize(); // 必须重新定位，否则高度不正确
    axios.get(`https://minio.trvqd.com/meta/${id}.json`)
    .then((response) => {
      this._config = response.data;
      this.setBackground();
    })
    .catch((error) => {
      console.log(error);
    }); 
  }
  /**
   * 展位初始化
   */
  boothInit(){
    this.__boothes.clear();
    this._controls = new OrbitControls(this.__camera, this.__renderer.domElement); // 拖动摄像机
    this._controls.maxPolarAngle = MathUtils.degToRad(85);
    for(const booth of this._config.boothes) {
      const g = new GlbLoader(booth);
      g.addEventListener(LOAD_EVENT.ANIMATION, e => {
        this._mixers.push(e.data);
      });
      g.position.x = booth.x;
      g.position.y = booth.z;
      g.position.z = booth.y;
      g.rotateY(MathUtils.degToRad(booth.degree));
      this.__boothes.add(g);
    }
  }
  setBackground() {
    const group:any = new GlbLoader(this._config.bg);
    // const group:any = new GlbLoader('./macao.glb');
    group.addEventListener(LOAD_EVENT.LOADING, (e:any)=> {
      this.onLoading(e.data);
    });
    group.addEventListener(LOAD_EVENT.LOADED, (e:any)=> {
      this.onLoaded(e);
      this.ready();
    });
    this.__bg.clear();
    this.__bg.add(group);
  }
  getLights() {
    const group = new Group();
    // const sun = new PointLight(0xffffff);
    const sun = new DirectionalLight(0xffffff, 0.8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -180;
    sun.shadow.camera.right = 180;
    sun.shadow.camera.top = -180;
    sun.shadow.camera.bottom = 180;
    sun.position.set(50, 50, 0);
    group.add(
      new AmbientLight(0xffffff, 0.6),
      sun
    );
    return group;
  }
  /**
   * 投射
   * @param x 横坐标
   * @param y 纵坐标
   */
  cast(x:number, y:number) {
    this._raycaster.setFromCamera({x, y}, this.__camera);
    const intersects:any = this._raycaster.intersectObjects(this.__boothes.children, false);
    let booth = null;
    if(intersects.length) {
      booth = intersects[0];
      for(const child of this.__boothes.children) {
        const model = child as GlbLoader;
        if(model.id === booth.id) {
          model.play();
        }else {
          model.pause();
        }
      }
      const v = this._controls.object.position.clone();
      v.add(booth.position.clone().sub(this._controls.target));
      new Tween(this._controls.target).to( booth.position, Static.DURATION).easing(Easing.Quadratic.In).start();
      new Tween(this._controls.object.position).to( v, Static.DURATION).easing(Easing.Quadratic.In).start();
    }
    return booth;
  }
  /**
   * 停止拖动
   * @param e 事件
   */
  onControlEnd = (e:Event) => {
    
  }
  /**
   * 模型加载中
   * @param e 事件
   */
   onLoading = (e:Event) => {
    const event = { type: EVENT.LOADING, data: e };
    this.dispatchEvent(event);
  }
  /**
   * 模型加载完毕
   * @param e 事件
   */
   onLoaded = (e:Event) => {
    const event = { type: EVENT.LOADED};
    this.dispatchEvent(event);
  }
  /**
   * 模型加载错误
   * @param e 事件
   */
  onLoadErrer = (e:Event) => {
    const event = { type: EVENT.LOAD_FAIL, data: e };
    this.dispatchEvent(event);
  };
  /**
   * 波浪
   */
  // waving = () => {
  //   const delta = this._clock.getDelta();
	// 	const time = this._clock.getElapsedTime() * 10;
  //   const position = this.__bg.wave;
  //   for ( let i = 0; i < position.count; i ++ ) {
  //     const y = 0.2 * Math.sin( i / 5 + ( time + i ) / 7 );
  //     position.setY( i, y );
  //   }
  //   position.needsUpdate = true;
  // };
  modelAnimate = () => {
    const delta = this._clock.getDelta();
    this._mixers.forEach(mixer => {
      mixer.update( delta );
    })
  }
  /**
   * 动画
   * @param time 时间
   */
  animate = (time:number)=> {
    requestAnimationFrame(this.animate);
    if(this._controls) this._controls.update();
    // this.waving();
    this.modelAnimate();
    TWEEN.update(time);
    this.__renderer.render(this.__scene, this.__camera);
  }
}

