import {
  WebGLRenderer, EventDispatcher, PerspectiveCamera,TextureLoader, Scene, Event, Object3D, 
  BackSide, Mesh, Group, SphereGeometry, Vector3, PointLight, MeshBasicMaterial, AmbientLight, CylinderGeometry, Color, PlaneGeometry, DynamicDrawUsage, RepeatWrapping, Clock, FogExp2, MathUtils, Raycaster
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN, { Tween, Easing } from '@tweenjs/tween.js';
import { IBooth } from '@/type/base';
import { GlbLoader, LOAD_EVENT } from './GlbLoader';

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
  _canvas;
  __camera:PerspectiveCamera; // 摄像头
  __scene; // 场景
  // __obj; //
  __bg; //背景
  __boothes; // 展位
  __renderer; // 渲染器
  _loader:any = null; // 加载器
  _controls:any = null; // 控制器
  _boothes:any;//
  _raycaster:Raycaster;// 射线
  _clock = new Clock();

  constructor(canvas:HTMLCanvasElement) {
    super();
    this._canvas = canvas;
    this.onResize();
    this.__scene = new Scene();
    this.__scene.background = new Color(0xaaccff);
    this.__scene.fog = new FogExp2( 0xaaccff, 0.0007 );
    this.__camera = new PerspectiveCamera(75, Static.WIDTH / Static.HEIGHT, 1, 10000);
    this.__camera.add(new PointLight(0xffffff, 1));
    this._raycaster = new Raycaster();
    this.__renderer = new WebGLRenderer({ canvas, antialias: true });
    this.__bg = this.getBackground();
    this.__boothes = new Group();
    this.__scene.add(
      this.__bg,
      this.__boothes,
      this.__camera,
      this.getLights()
    );
    window.addEventListener('resize', this.onResize);
    this.animate(0);
  }
  getLights() {
    const group = new Group();
    const light0 = new PointLight(0xffffff, 0.6);
    light0.position.set(0, 20, 0);
    const light1 = new PointLight(0xffffff, 0.6);
    const light2 = new PointLight(0xffffff, 0.6);
    light2.position.set(90, 0, 0);
    const light3 = new PointLight(0xffffff, 0.6);
    light3.position.set(-90, 0, 0);
    const light4 = new PointLight(0xffffff, 0.6);
    light4.position.set(0, 0, 90);
    const light5 = new PointLight(0xffffff, 0.6);
    light5.position.set(0, 0, -90);
    group.add(
      new AmbientLight(0xffffff, 2),
      light0,
      light1,
      light2,
      light3,
      light4,
      light5,
    );
    return group;
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
    this.__camera.position.set(0, 100, 0);
    this.__camera.lookAt(new Vector3(0,0,0));
    const t = new Tween(this.__camera.position).to(new Vector3(0,20,20), Static.DURATION);
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
  start(boothes:IBooth[]) {
    this.onResize(); // 必须重新定位，否则高度不正确
    this._boothes = boothes;
  }
  /**
   * 展位初始化
   */
  boothInit(){
    this._controls = new OrbitControls(this.__camera, this.__renderer.domElement); // 拖动摄像机
    this._controls.maxPolarAngle = MathUtils.degToRad(85);
    for(const booth of this._boothes) {
      const g = new GlbLoader(booth.url);
      g.position.x = booth.x;
      g.position.y = booth.z;
      g.position.z = booth.y;
      g.rotateY(MathUtils.degToRad(booth.degree));
      this.__boothes.add(g);
    }
  }
  /**
   * 获得背景
   */
  getBackground() {
    const group:any = new GlbLoader('https://minio.trvqd.com/meta/macao.glb');
    group.addEventListener(LOAD_EVENT.LOADED, ()=> this.ready());
    const worldWidth = 512, worldDepth = 512;
    const geometry = new PlaneGeometry( 20000, 20000, worldWidth - 1, worldDepth - 1 );
		geometry.rotateX( - Math.PI / 2 );
    const position:any = geometry.attributes.position;
    group.wave = position;
    const texture = new TextureLoader().load( 'https://minio.trvqd.com/meta/water.jpg' );
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set( 10, 10 );
		const material = new MeshBasicMaterial( { color: 0x0044ff, map: texture } );
		group.add(new Mesh( geometry, material ));
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
    if(intersects.length) {
      const booth = intersects[0];
      const v = this._controls.object.position.clone();
      v.add(booth.position.clone().sub(this._controls.target));
      new Tween(this._controls.target).to( booth.position, Static.DURATION).easing(Easing.Quadratic.In).start();
      new Tween(this._controls.object.position).to( v, Static.DURATION).easing(Easing.Quadratic.In).start();
    }
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
  waving = () => {
    const delta = this._clock.getDelta();
		const time = this._clock.getElapsedTime() * 10;
    const position = this.__bg.wave;
    for ( let i = 0; i < position.count; i ++ ) {
      const y = 0.2 * Math.sin( i / 5 + ( time + i ) / 7 );
      position.setY( i, y );
    }
    position.needsUpdate = true;
  };
  /**
   * 动画
   * @param time 时间
   */
  animate = (time:number)=> {
    requestAnimationFrame(this.animate);
    if(this._controls) this._controls.update();
    this.waving();
    TWEEN.update(time);
    this.__renderer.render(this.__scene, this.__camera);
  }
}

