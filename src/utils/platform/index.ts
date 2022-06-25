import {
  WebGLRenderer, EventDispatcher, PerspectiveCamera,TextureLoader, Scene, Event, Object3D, 
  BackSide, Mesh, Group, SphereGeometry, Vector3, PointLight, MeshBasicMaterial, AmbientLight, CylinderGeometry
} from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { DeviceOrientationControls } from '@/utils/device-orientation-controls';
import TWEEN, { Tween, Easing } from '@tweenjs/tween.js';

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
  __camera; // 摄像头
  __scene; // 场景
  // __obj; //
  // __bg;//
  __renderer; // 渲染器
  _loader:any = null; // 加载器
  _controls:any = null; // 控制器
  _gyro:any = null; // 陀螺仪

  constructor(canvas:HTMLCanvasElement) {
    super();
    this._canvas = canvas;
    this.onResize();
    this.__scene = new Scene();
    this.__camera = new PerspectiveCamera(75, Static.WIDTH / Static.HEIGHT, 0.01, 10000);
    this.__camera.position.set(0, 20, Static.CAMERA_FAR);
    this.__camera.add(new PointLight(0xffffff, 0.8))
    this.__renderer = new WebGLRenderer({ canvas, antialias: true });
    this.loaderInit();
    this.__scene.add(
      this.__camera,
      this.getLights(),
      // this.getBackground(),
      // this.getField()
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
      new AmbientLight(0xffffff, 1),
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
   * 开始
   */
  start() {
    this.onResize(); // 必须重新定位，否则高度不正确
    this._controls = new TrackballControls(this.__camera, this.__renderer.domElement); // 拖动摄像机
    this._controls.rotateSpeed = 1.0;
    this._controls.zoomSpeed = 1.2;
    // this._controls.noPan = true;
    // this._controls.maxDistance = 60;
    this._controls.panSpeed = 0.8;
    // this._controls.enablePan = false;
    // this._controls.addEventListener('end', this.onControlEnd); // 拖动摄像机之后还原
    // this._gyro = new DeviceOrientationControls(this.__obj); // 陀螺仪控制物体

    // this.changeModel('models/map-pixel.glb', new Vector3(0,0,0));
    this.changeModel('models/macao.glb', new Vector3(0,0,0));
    const g1 = this.getField('models/car.glb');
    g1.position.x = -10;
    g1.position.y = 1;
    g1.position.z = -25;
    g1.rotation.y = 1;
    const g2 = this.getField('models/cab.glb');
    g2.position.y = 1;
    g2.position.z = 1;
    this.__scene.add( g1, g2 );
    // this.changeModel('models/caa.glb', new Vector3(-10,0,0));
    // this.changeModel('models/itss.glb', new Vector3(0,0,-10));
  };
  changeModel(url:string, position:Vector3) {
    this._loader.load(url, (gltf:any) => {
      gltf.scene.name = '3dmodel';
      const g = new Object3D();
      g.add(gltf.scene);
      g.position.x = position.x;
      g.position.y = position.y;
      g.position.z = position.z;
      this.__scene.add(g);
      const event = { type: EVENT.LOADED, data: gltf };
      this.dispatchEvent(event);  
    }, this.onLoading, this.onLoadErrer);
  }
  getField(url:string) {
    const group = new Group();
    this._loader.load(url, (gltf:any) => {
      gltf.scene.name = '3dfield';
      group.add(gltf.scene);
      const event = { type: EVENT.LOADED, data: gltf };
      this.dispatchEvent(event);  
    }, this.onLoading, this.onLoadErrer);
    return group;
  }
  getBackground() {
    const group = new Group();
    const background = new Mesh(
      new SphereGeometry(100,100,100),
      new MeshBasicMaterial({
        color: 0x00ff00
      })
    );
    group.add(
      background
    );
    return group;
  }
  envToModel(texture:any, obj:any) {
    if(obj.meterial) {
      obj.meterial.envMap = texture;
      obj.meterial.needsUpdate = true;
    }
    if(obj.children.length > 0) {
      this.envToModel(texture, obj.children[0]);
    }
  }
  loaderInit() {
    const dracoLoader =new DRACOLoader();
    this._loader = new GLTFLoader();
    dracoLoader.setDecoderPath('./gltfdraco/');
    dracoLoader.setDecoderConfig({ type:'js'});
    dracoLoader.preload();
    this._loader.setDRACOLoader(dracoLoader);
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
  }
  animate = (time:number)=> {
    requestAnimationFrame(this.animate);
    if(this._controls) this._controls.update();
    TWEEN.update(time);
    this.__renderer.render(this.__scene, this.__camera);
  }
}

