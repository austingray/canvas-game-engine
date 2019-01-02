var game = (function () {
  'use strict';

  class Layer {
    /**
     * Creates an instance of Layer.
     * @param {*} id
     * @param {*} [args={}]
     * @memberof Layer
     */
    constructor(id, args = {}) {
      // get width/height
      this.width = args.width;
      this.height = args.height;
      this.name = args.name;
      this.visible = (typeof args.visible === 'undefined') ? true : args.visible;
      this.parentElement = (typeof args.appendTo === 'undefined') ? document.body : args.appendTo;

      // create the canvas element and add it to the document body
      const element = document.createElement('canvas');
      element.id = id;
      element.width = this.width;
      element.height = this.height;
      element.style.left = args.left;
      element.style.top = args.top;
      this.parentElement.appendChild(element);
      this.element = element;

      if (!this.visible) {
        element.setAttribute('style', 'display: none;');
      }

      // get the context
      this.context = element.getContext(args.context);
    }

    /**
     * Toggle canvas element visibility
     *
     * @memberof Layer
     */
    toggleVisible() {
      if (this.visible) {
        this.visible = false;
        // this.element.setAttribute('style', 'display: none;');
        this.element.style.display = 'none';
      } else {
        this.visible = true;
        this.element.style.display = 'block';
      }
    }

    /**
     * Clears the layer
     *
     * @memberof Layer
     */
    clear() {
      if (typeof this.context.clearRect !== 'undefined') {
        this.context.clearRect(0, 0, this.width, this.height);
      }
    }

    /**
     * Deletes the layer
     *
     * @memberof Layer
     */
    delete() {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Calculates drawing x/y offsets
   *
   * @class Camera
   */
  class Camera {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.x = width / 2;
      this.y = height / 2;
      this.offsetX = 0;
      this.offsetY = 0;
    }

    /**
     * Sets camera focus on an object
     *
     * @param {*} object
     * @param {boolean} [centered=false]
     * @memberof Camera
     */
    setFocus(object, centered = false) {
      // if we're at the right edge of the viewport
      if (
        this.x > (this.width * .6) - this.offsetX
        && object.x >= this.x
      ) {
        this.screenPushX = this.width * .6;
        this.offsetX = this.screenPushX - this.x;
      }

      // left edge
      if (
        this.x < (this.width * .4) - this.offsetX
        && object.x <= this.x
      ) {
        this.screenPushX = this.width * .4;
        this.offsetX = this.screenPushX - this.x;
      }

      // top edge
      if (
        this.y < (this.height * .4) - this.offsetY
        && object.y <= this.y
      ) {
        this.screenPushY = this.height * .4;
        this.offsetY = this.screenPushY - this.y;
      }

      // bottom edge
      if (
        this.y > (this.height * .6) - this.offsetY
        && object.y >= this.y
      ) {
        this.screenPushY = this.height * .6;
        this.offsetY = this.screenPushY - this.y;
      }

      if (centered) {
        this.x = object.x;
        this.y = object.y;
        this.screenPushX = this.width / 2;
        this.screenPushY = this.height / 2;
        this.offsetX = Math.round(this.width / 2 - this.x);
        this.offsetY = Math.round(this.height / 2  - this.y);
      } else {
        // convert floats to integers
        this.offsetX = Math.round(this.offsetX);
        this.offsetY = Math.round(this.offsetY);
      }

      // update this
      this.x = object.x;
      this.y = object.y;
    }

    /**
     * Checks if a set of coords is inside the camera viewport
     * Note: the viewport is not 1:1 with what is visible, it is larger
     *
     * @param {*} x1
     * @param {*} y1
     * @param {*} x2
     * @param {*} y2
     * @returns
     * @memberof Camera
     */
    inViewport(x1, y1, x2, y2) {
      // calc the viewport
      const vpX1 = this.x - this.width;
      const vpX2 = this.x + this.width;
      const vpY1 = this.y - this.height;
      const vpY2 = this.y + this.height;

      // if in viewport
      if (
        x2 > vpX1
        && x1 < vpX2
        && y2 > vpY1
        && y1 < vpY2
      ) {
        return true;
      }

      // if not in viewport
      return false;
    }
  }

  class Shadows {
    /**
     * Create core three.js items
     * @param {*} args
     * @memberof Shadows
     */
    constructor(args) {
      // parse args
      this.domElement = args.domElement;
      this.width = args.width;
      this.height = args.height;

      this.init();
      this.createLights();
      this.createPlane();
      // this.helper = new THREE.CameraHelper( this.camera );
      // this.scene.add( this.helper );

      // postprocessing
      this.composer = new THREE.EffectComposer( this.renderer );
      this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

      // var dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
      // dotScreenEffect.uniforms[ 'scale' ].value = 4;
      // this.composer.addPass( dotScreenEffect );

      // var rgbEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
      // rgbEffect.uniforms[ 'amount' ].value = 0.0015;
      // rgbEffect.renderToScreen = true;
      // this.composer.addPass( rgbEffect );

      var invertEffect = new THREE.ShaderPass( THREE.InvertShader );
      invertEffect.renderToScreen = true;
      this.composer.addPass(invertEffect);
    }

    init() {
      // init canvas
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 5000 );
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: this.domElement,
        antialias: true,
      });
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.setClearAlpha(0);
      this.renderer.setClearColor( 0xFFFFFF, 0);
      this.renderer.shadowMap.enabled = true;
      // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

      // const fogColor = new THREE.Color(0x000000);
      // this.scene.fog = new THREE.Fog(fogColor, 0.0025, 5000);
    }

    /**
     * Create light sources
     *
     * @memberof Shadows
     */
    createLights() {
      this.light = new THREE.PointLight( 0xFFFFFF, 5, 300, 0.5 );
      this.light.castShadow = true;
      this.light.position.set( 0, 0, -25 );
      this.scene.add(this.light);
      
      this.light.shadow.mapSize.width = 512;  // default
      this.light.shadow.mapSize.height = 512; // default
      this.light.shadow.camera.near = 0.5;       // default
      this.light.shadow.camera.far = this.width;      // default
      this.light.shadow.radius = 5;
    }

    /**
     * The surface that receives shadows
     *
     * @memberof Shadows
     */
    createPlane() {
      // create the plane that the shadows get cast to
      const material = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        opacity: 1,
        transparent: true,
      });

      // material.shininess = 0;
      // material.specular = new THREE.Color(0x000000);

      
      // const transparentPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      // const texture = new THREE.TextureLoader().load(transparentPng);
      // texture.wrapS = THREE.RepeatWrapping;
      // texture.wrapT = THREE.RepeatWrapping;
      // texture.repeat.set( 999999, 999999 );
      
      // const material = new THREE.MeshPhongMaterial({
      //   map: texture,
      //   alphaMap
      //   opacity: 1,
      //   transparent: true,
      //   visible: false,
      //   color: 0x333333,
      //   blending: THREE.NoBlending,
      //   side: THREE.DoubleSide,
      //   alphaTest: 0.5,
      // });

      // material.blending = THREE.CustomBlending;
      // material.blendEquation = THREE.AddEquation; //default
      // material.blendEquation = THREE.MaxEquation;

      // test blending
      // this.sourceFactors = [
      //   THREE.ZeroFactor,
      //   THREE.OneFactor,
      //   THREE.SrcColorFactor,
      //   THREE.OneMinusSrcColorFactor,
      //   THREE.SrcAlphaFactor,
      //   THREE.OneMinusSrcAlphaFactor,
      //   THREE.DstAlphaFactor,
      //   THREE.OneMinusDstAlphaFactor,
      //   THREE.DstColorFactor,
      //   THREE.OneMinusDstColorFactor,
      //   THREE.SrcAlphaSaturateFactor,
      // ];

      // this.i = 0;
      // this.j = 0;
      // // this.j = 0;
      // window.setInterval(() => {
      //   this.plane.material.opacity += .1;
        
      //   if (this.plane.material.opacity >= 1) {
      //     this.plane.material.opacity = 0;

      //     // this.plane.material.blendSrc = this.sourceFactors[this.i];
      //     this.plane.material.blendDst = this.sourceFactors[this.i];
      //     if (this.i === this.sourceFactors.length - 1) {
      //       this.i = 0;
      //     } else {
      //       this.i++;
      //     }
      //   }
      // }, 100);

      // material.blendSrc = this.sourceFactors[4]; //default
      // material.blendDst = this.sourceFactors[0]; //default
      
      // const material = new THREE.ShadowMaterial();
      // material.onBeforeCompile = function(shader) {
      //   shadoer.fragmentShader = `
      //     precision mediump float;

      //     varying vec2 vUv;

      //     void main( void ) {
      //       gl_FragColor = vec4( vec3( 0 ), vUv.y );
      //     }

      //     ${shader.fragmentShader}
      //   `;

      //   shader.vertexShader = `
      //     precision highp float;
      //     precision highp int;

      //     uniform mat4 modelMatrix;
      //     uniform mat4 modelViewMatrix;
      //     uniform mat4 projectionMatrix;
      //     uniform mat4 viewMatrix;
      //     uniform mat3 normalMatrix;

      //     attribute vec3 position;
      //     attribute vec3 normal;
      //     attribute vec2 uv;
      //     attribute vec2 uv2;

      //     varying vec2 vUv;

      //     void main() {
      //       vUv = uv;
      //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      //     }

      //     ${shader.vertexShader}
      //   `;
      // }
      // material.opacity = 1;

        // material.fog = true;
      
      // const material = new THREE.ShaderMaterial({
      //   vertexShader: document.getElementById( 'vertexShader' ).textContent,
      //   fragmentShader: document.getElementById( 'fragmentShader' ).textContent
      // });
      
      const geometry = new THREE.BoxGeometry(this.width, this.height, 1);
      this.plane = new THREE.Mesh( geometry, material );

      // var planeGeometry = new THREE.PlaneBufferGeometry(this.width, this.height, 32, 32 );
      // var planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
      // this.plane = new THREE.Mesh(planeGeometry, planeMaterial)

      this.scene.add(this.plane);
      this.plane.receiveShadow = true;
   }

    draw(Canvas) {
      const Camera = Canvas.Camera;
      
      // update the shadow receive plane position
      this.plane.position.x = 0;
      this.plane.position.y = 0;

      this.light.position.x = Camera.x + Camera.offsetX - Camera.width / 2 + 25;
      this.light.position.y = Camera.y + Camera.offsetY - Camera.height / 2 + 25;
      // this.light.position.z = 100;
      // this.light.position.x = 0;
      // this.light.position.y = 0;

      // this.directionalLight.position.x = 0;
      // this.directionalLight.position.y = 0;
      // this.directionalLight.position.z = -100;
      // this.directionalLightTarget.x = Camera.x + Camera.offsetX - Camera.width / 2 + 25;
      // this.directionalLightTarget.y = Camera.y + Camera.offsetY - Camera.height / 2 + 25;
      // this.directionalLightTarget.z = 0;
      
      // update camera position
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      // this.camera.position.x = Camera.x + Camera.offsetX - Camera.width / 2;
      // this.camera.position.y = Camera.y + Camera.offsetY - Camera.height / 2;
      this.camera.position.z = -5000;
      // this.camera.lookAt(new THREE.Vector3(Camera.x, Camera.y, 0));
      this.camera.rotation.z = 180 * Math.PI / 180;
      this.camera.rotation.y = 180 * Math.PI / 180;

      // render
      this.renderer.render(this.scene, this.camera);
      this.composer.render();

      Canvas.pushDebugText('blendSrc', `this.plane.material.blendSrc: ${this.plane.material.blendSrc}`);
      Canvas.pushDebugText('blendDst', `this.plane.material.blendDst ${this.plane.material.blendDst}`);

      const gl = Canvas.shadowLayer.context;
      // glEnable(GL_BLEND);
      // glBlendFunc(GL_ONE_MINUS_DST_COLOR, GL_ZERO);
      // gl.enable(gl.BLEND);
      // gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ZERO);
      // gl.getParameter(gl.BLEND_SRC_RGB) == gl.SRC_COLOR;
      // gl_FragColor = vec4(1.0 - textureColor.r,1.0 -textureColor.g,1.0 -textureColor.b,1)

      // gl.enable(gl.BLEND);
      // gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ZERO);
      // gl.fragColor = gl.vec4(1.0, 1.0, 1.0, 1.0);
      this.plane.material.needsUpdate = true;
    }
  }

  class Shadows2 {
    /**
     * Create core three.js items
     * @param {*} args
     * @memberof Shadows
     */
    constructor(args) {
      // parse args
      this.domElement = args.domElement;
      this.canvasElement = args.canvasElement;
      this.width = args.width;
      this.height = args.height;

      this.init();
      this.createLights();
      this.createPlane();
    }

    init() {
      // init canvas
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 5000 );
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.position.z = 1000;
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        canvas: this.domElement,
        antialias: true,
      });
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.setClearAlpha(1);
      this.renderer.setClearColor( 0xFFFFFF, 0);
    }

    createLights() {
      this.light = new THREE.PointLight( 0xFFFFFF, 20, 300, .5 );
      this.light.castShadow = true;
      this.light.position.set( 0, 0, -25 );
      this.scene.add(this.light);

      // this.directionalLight = new THREE.DirectionalLight( 0x333333, 0.5 );
      // this.scene.add( this.directionalLight );
      // this.directionalLight.castShadow = true;
      // this.directionalLightTarget =  new THREE.Object3D();
      // this.scene.add(this.directionalLightTarget);
      // this.directionalLight.target = this.directionalLightTarget;

      //Set up shadow properties for the light
      
      this.light.shadow.mapSize.width = 512;  // default
      this.light.shadow.mapSize.height = 512; // default
      this.light.shadow.camera.near = 0.5;       // default
      this.light.shadow.camera.far = this.width;      // default
      // this.light.shadow.radius = 5;
    }

    /**
     * The surface that receives shadows
     *
     * @memberof Shadows
     */
    createPlane() {
      const texture = new THREE.CanvasTexture( this.canvasElement );
      
      const material = new THREE.MeshBasicMaterial({
        alphaMap: texture,
        opacity: 1,
        transparent: true,
        color: 0x000000,
        alphaTest: 0,
      });
      
      const geometry = new THREE.BoxGeometry(this.width, this.height, 1);
      this.plane = new THREE.Mesh( geometry, material );

      // var planeGeometry = new THREE.PlaneBufferGeometry(this.width, this.height, 32, 32 );
      // var planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
      // this.plane = new THREE.Mesh(planeGeometry, planeMaterial)

      this.scene.add(this.plane);
      this.plane.receiveShadow = true;
      // this.plane.scale.x = -1
    }

    draw() {

      this.plane.material.alphaMap.needsUpdate = true;
      
      // render
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Creates a canvas and provides methods for drawing to it
   * @class Canvas
   */
  class Canvas {
    constructor(args = {}) {
      // set constants
      this.width = args.width;
      this.height = args.height;

      // for consistent spacing off the canvas edge
      this.padding = 24;

      // generate all the <canvas> elements
      this.generateLayers();

      // generate object caches
      this.generateObjectCaches();

      // set a default ctx
      this.ctx = this.primaryLayer.context;
      
      // camera
      this.Camera = new Camera(this.width, this.height);

      // shadows
      this.Shadows = new Shadows({
        width: this.width,
        height: this.height,
        domElement: this.getLayerByName('shadow3d').element,
      });

      // shadows
      this.Shadows2 = new Shadows2({
        width: this.width,
        height: this.height,
        domElement: this.getLayerByName('shadow3dtexture').element,
        canvasElement: this.getLayerByName('shadow3d').element,
      });

      console.log(this.getLayerByName('shadow3d').context);
    }

    /**
     * Generates all the layers, called in constructor
     *
     * @memberof Canvas
     */
    generateLayers() {
      // create the canvas container div
      this.canvasDiv = {};
      this.canvasDiv.element = document.createElement('div');    this.canvasDiv.element.setAttribute('style', `width: ${this.width}px; height: ${this.height}px; background: #000000;`);
      this.canvasDiv.element.id = 'domParent';
      document.body.appendChild(this.canvasDiv.element);

      this.layers = [];
      this.canvasId = 0;

      // create canvas layers
      this.createLayer('background');
      this.createLayer('primary');
      this.createLayer('character');
      this.createLayer('secondary');
      this.createLayer('override');
      this.createLayer('shadow');
      this.createLayer('shadow3d', {
        context: 'webgl',
        // left: '-9999px',
        // top: '-9999px',
      });
      this.createLayer('shadow3dtexture', {
        context: 'webgl',
      });
      this.createLayer('hud');
      this.createLayer('menu');
      this.createLayer('debug');

      // get explicit reference to debug layer
      this.debugLayer = this.getLayerByName('debug');
      this.debugKeys = [];
      this.debugText = [];

      // primary, secondary, override
      this.primaryLayer = this.getLayerByName('primary');
      this.secondaryLayer = this.getLayerByName('secondary');
      this.overrideLayer = this.getLayerByName('override');

      // get reference to shadow layer
      this.shadowLayer = this.getLayerByName('shadow');

      // create a tmp div for generating images
      this.tmpDiv = document.createElement('div');
      this.tmpDiv.setAttribute('style', `width: 50px; height: 50px; position: absolute; left: -99999px`);
      this.tmpDiv.id = 'hidden';
      document.body.appendChild(this.tmpDiv);

      this.createLayer('tmp', {
        appendTo: this.tmpDiv,
        width: 50,
        height: 50,
      });
    }

    /**
     * Creates a new canvas layer
     *
     * @param {*} name
     * @param {*} [args={}]
     * @memberof Canvas
     */
    createLayer(name, args = {}) {
      // assign a unique id
      this.canvasId++;
      const id = `canvas-${this.canvasId}`;

      // get width/height
      const width = (typeof args.width === 'undefined') ? this.width : args.width;
      const height = (typeof args.height === 'undefined') ? this.height : args.height;
      const left = (typeof args.left === 'undefined') ? 0 : args.left;
      const top = (typeof args.top === 'undefined') ? 0 : args.top;

      const appendTo = (typeof args.appendTo === 'undefined') ? document.body : args.appendTo;

      // context
      const context = (typeof args.context === 'undefined') ? '2d' : args.context;

      // visible
      const visible = (typeof args.visible === 'undefined') ? true : args.visible;

      // add 'er to the stack
      this.layers.push(new Layer(id, {
        name,
        width,
        height,
        context,
        visible,
        appendTo,
        left,
        top,
      }));
    }

    /**
     * Triggers a layer's delete method
     * TODO: remove from layer array
     *
     * @param {*} name
     * @memberof Canvas
     */
    deleteLayer(name) {
      const layer = this.getLayerByName(name);
      layer.delete();
    }

    /**
     * Creates the purple circle hero image
     *
     * @returns
     * @memberof Canvas
     */
    createImage() {
      const layer = this.getLayerByName('tmp');
      layer.context.clearRect(0, 0, 50, 50);
      const radius = 25;

      // draw
      layer.context.fillStyle = this.randomHexValue();
      layer.context.beginPath();
      layer.context.arc(
        radius,
        radius,
        radius,
        Math.PI / 180 * 0,
        Math.PI / 180 * 360,
        false
      );

      
      layer.context.fill();
      layer.context.closePath();

      var img = layer.element.toDataURL();

      return img;
    }

    /**
     * Generates a random HEX
     * https://jsperf.com/random-hex-color-generation
     *
     * @returns
     * @memberof Canvas
     */
    randomHexValue() {
      var color = '#';
      var c = '0123456789ABCDEF'.split('');

      for (var i = 0; i < 6; i++) {
        color += c[Math.floor(Math.random() * c.length)];
      }

      return color;
    }

    /**
     * Generates all object types
     *
     * @memberof Canvas
     */
    generateObjectCaches() {

    }

    /**
     * Sets this.ctx to a layer's context by its name
     *
     * @param {*} layerName
     * @memberof Canvas
     */
    setContext(layerName) {
      const layer = this.getLayerByName(layerName);
      this.ctx = layer.context;
    }

    /**
     * Gets a layer by name
     *
     * @param {*} name
     * @returns {Layer}
     * @memberof Canvas
     */
    getLayerByName(name) {
      const layer = this.layers.filter(layer => layer.name === name)[0];
      return layer;
    }

    /**
     * Clears a canvas
     * @memberof Canvas
     */
    clear(index) {
      const layer = this.layers[index];
      const ctx = layer.context;
      ctx.clearRect(0, 0, layer.width, layer.height);
    }

    /**
     * Clear a layer by its name
     *
     * @param {*} layerName
     * @memberof Canvas
     */
    clearLayer(layerName) {
      this.getLayerByName(layerName).clear();
    }

    /**
     * Clear an array of layers
     *
     * @param {array} layers
     * @memberof Canvas
     */
    clearLayers(layers) {
      for (let i = 0; i < layers.length; i++) {
        this.getLayerByName(layers[i]).clear();
      }
    }

    /**
     * Draws text to the canvas
     * @param {string} txt
     * @param {integer} x
     * @param {integer} y
     * @param {string} [font='32px Arial']
     * @param {string} [fillStyle='#FFFFFF']
     * @memberof Canvas
     */
    drawText(txt, x, y, font = '32px Arial', fillStyle = '#FFFFFF') {
      this.ctx.font = font;
      this.ctx.fillStyle = fillStyle;
      this.ctx.fillText(txt, x, y);
    }

    pushDebugText(key, text) {
      if (this.debugKeys.indexOf(key) === -1) {
        this.debugKeys.push(key);
      }
      this.debugText[key] = text;
    }

    /**
     * Draws debug text
     * @param {string} txt
     * @memberof Canvas
     */
    drawDebugText(txt) {
      this.debugLayer.context.font = "18px Arial";
      this.debugLayer.context.fillStyle = 'white';
      this.debugKeys.forEach((key, i) => {
        this.debugLayer.context.fillText(this.debugText[key], this.padding, this.height - this.padding - i * 18);
      });
    }

    /**
     * Draws a circle
     *
     * @param {*} args
     * @memberof Canvas
     */
    drawCircle(args) {
      // offset for camera
      const x = args.x + this.Camera.offsetX;
      const y = args.y + this.Camera.offsetY;
      const radius = args.radius;

      // draw
      this.ctx.fillStyle = args.fillStyle;
      this.ctx.beginPath();
      this.ctx.arc(
        x,
        y,
        radius,
        args.startAngle,
        args.endAngle,
        args.anticlockwise,
      );
      this.ctx.fill();
      // this.ctx.strokeStyle = '#500050';
      // this.ctx.lineWidth = 1;
      // this.ctx.stroke();
      this.ctx.closePath();
    }

    /**
     * Draws the character
     *
     * @param {*} args
     * @memberof Canvas
     */
    drawCharacter(args) {    
      // offset for camera
      const x = args.x + this.Camera.offsetX;
      const y = args.y + this.Camera.offsetY;
      this.ctx.drawImage(args.image, x, y, args.width, args.height);
    }

    drawDebugLine(p1, p2) {
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(300,150);
      ctx.stroke();
    }

    drawMap(image) {
      this.ctx.drawImage(image, this.Camera.offsetX, this.Camera.offsetY);
    }

    drawTile(tile) {
      // draw the tile
      const x = tile.x + this.Camera.offsetX;
      const y = tile.y + this.Camera.offsetY;

      this.ctx = this.primaryLayer.context;
      switch (tile.type) {
        case 'rock':
          this.ctx = this.overrideLayer.context;
          this.ctx.fillStyle = '#888787';
          this.ctx.strokeStyle = '#464242';
          break;

        case 'tree':
          this.ctx.fillStyle = '#008000';
          this.ctx.strokeStyle = '#063c06';
          break;
        
        case 'desert':
          this.ctx.fillStyle = '#e2c55a';
          this.ctx.strokeStyle = '#d0ab25';
          break;

        case 'water':
          this.ctx.fillStyle = 'blue';
          break;

        case 'grass':
        default:
          this.ctx.fillStyle = '#008000';
          this.ctx.strokeStyle = '#063c06';
          break;
      }

      if (tile.type === 'torch') {
        this.ctx = this.primaryLayer.context;
        this.drawCircle({
          x: tile.x + 25,
          y: tile.y + 25,
          radius: 5,
          fillStyle: 'rgba(255, 155, 0, 1)',
          startAngle: Math.PI / 180 * 0,
          endAngle: Math.PI / 180 * 360,
          anticlockwise: false,
        });
      }

      if (tile.type === 'tree') {
        this.ctx.fillRect(x, y, tile.width, tile.height);
        this.ctx = this.secondaryLayer.context;
        this.drawCircle({
          x: tile.x + 25,
          y: tile.y + 25,
          radius: 15,
          fillStyle: 'brown',
          startAngle: Math.PI / 180 * 0,
          endAngle: Math.PI / 180 * 360,
          anticlockwise: false,
        });
        this.drawCircle({
          x: tile.x + 25,
          y: tile.y + 25,
          radius: 50,
          fillStyle: 'rgba(40, 202, 0, .8)',
          startAngle: Math.PI / 180 * 0,
          endAngle: Math.PI / 180 * 360,
          anticlockwise: false,
        });
      } else {
        this.ctx.fillRect(x, y, tile.width, tile.height);
      }

      this.ctx = this.primaryLayer.context;
    }

    /**
     * Calculates the starting x pos to center a string
     * @param {string} text the text to be measured
     * @param {string} font canvas context font
     * @returns {integer} x coordinate
     * @memberof Canvas
     */
    calcCenteredTextX(text, font) {
      this.ctx.font = font;
      const width = this.ctx.measureText(text).width;
      return (this.width / 2 - width / 2);
    }

    /**
     * Calculates x position for an array of strings to be stacked centered and left justified
     * @param {array} txtArr
     * @param {string} [font='32px Arial']
     * @returns {integer} x coordinate
     * @memberof Canvas
     */
    calcCenteredTextBoxX(txtArr, font = '32px Arial') {
      // set the font size to calculate with
      this.ctx.font = font;

      // get the width of each string
      const strWidthArr = txtArr.map(txt => this.ctx.measureText(txt).width);

      // get the longest width
      const longest = strWidthArr.reduce((a, b) => Math.max(a, b));

      // calculate and return x
      return (this.width / 2) - (longest / 2);
    }

    /**
     * Calculates text width
     * @param {*} txt
     * @param {*} font
     * @returns
     * @memberof Canvas
     */
    calcTextWidth(txt, font) {
      this.ctx.font = font;
      return this.ctx.measureText(txt).width;
    }

    /**
     * Draws a black gradient across the entire canvas
     * @memberof Canvas
     */
    drawGradientBackground() {
      const grd = this.ctx.createLinearGradient(0, 0, this.width, this.height);
      grd.addColorStop(0, '#333333');
      grd.addColorStop(1, '#000000');
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Creates a rounded rectangle
     * https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
     *
     * @param {*} ctx
     * @param {*} x
     * @param {*} y
     * @param {*} width
     * @param {*} height
     * @param {*} radius
     * @param {*} fill
     * @param {*} stroke
     * @memberof Canvas
     */
    roundRect(ctx, x, y, width, height, radius, fill, stroke) {
      if (typeof stroke == 'undefined') {
        stroke = true;
      }
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
      } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side];
        }
      }
      ctx.beginPath();
      ctx.moveTo(x + radius.tl, y);
      ctx.lineTo(x + width - radius.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      ctx.lineTo(x + width, y + height - radius.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
      ctx.lineTo(x + radius.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      ctx.lineTo(x, y + radius.tl);
      ctx.quadraticCurveTo(x, y, x + radius.tl, y);
      ctx.closePath();
      if (fill) {
        ctx.fill();
      }
      if (stroke) {
        ctx.stroke();
      }

    }
  }

  /**
   * A text object for the canvas to display
   *
   * @class ObjectText
   */
  class ObjectText {
    constructor(args) {
      this.args = args;
      this.text = args.text;
      this.x = args.x;
      this.y = args.y;
      this.font = (typeof args.font !== 'undefined') ? args.font : '32px Arial';
      this.fillStyle = (typeof args.fillStyle !== 'undefined') ? args.fillStyle : '#FFFFFF';
      this.id = (typeof args.id !== 'undefined') ? args.id : null;
    }

    /**
     * Draws the text object using the canvas drawText method
     *
     * @param {Canvas} Canvas
     * @memberof ObjectText
     */
    draw(Canvas) {
      Canvas.drawText(this.text, this.x, this.y, this.font, this.fillStyle);
    }

    /**
     * Set the X coord
     *
     * @param {integer} x
     * @memberof ObjectText
     */
    setX(x) {
      this.x = x;
    }

    /**
     * Set the Y coord
     *
     * @param {integer} y
     * @memberof ObjectText
     */
    setY(y) {
      this.y = y;
    }
  }

  /**
   * Extends the ObjectText with a callback method
   *
   * @class ObjectTextInteractive
   * @extends {ObjectText}
   */
  class ObjectTextInteractive extends ObjectText {
    callback() {
      this.args.callback();
    }
  }

  /**
   * Draws a circle to the Canvas
   *
   * @class ObjectCircle
   */
  class ObjectCircle {
    constructor(args, game) {    
      // access to the game object
      this.game = game;

      this.args = args;
      this.x = args.x;
      this.y = args.y;
      this.radius = args.radius;
      this.fillStyle = args.fillStyle;
      this.startAngle = Math.PI / 180 * 0;
      this.endAngle = Math.PI / 180 * 360;
      this.anticlockwise = false;

      this.init(args.map);
    }

    draw(Canvas) {
      Canvas.drawCircle({
        fillStyle: this.fillStyle,
        x: this.x,
        y: this.y,
        radius: this.radius,
        startAngle: this.startAngle,
        endAngle: this.endAngle,
        anticlockwise: this.anticlockwise,
      });
    }
  }

  class ObjectMenu {
    /**
     * Creates an instance of ObjectMenu.
     * @param {*} args
     * @memberof ObjectMenu
     */
    constructor(args, game) {
      // default to having focus
      this.hasFocus = true;
      
      // reference to the game object
      this.game = game;

      // the arrow indicator symbol
      const arrowText = ')';

      // calculate the menu starting x position.
      this.startX = this.game.Canvas.calcCenteredTextBoxX(args.options.map(option => `${option.text}`));

      // create the option objects
      this.createOptionObjects(args.options);

      // set the focus menu object to the first one.
      this.focusMenuObject = this.options[0];

      // create the arrow
      this.createArrow(arrowText);

      // update the start x to accommodate for the arrow
      this.startX = this.startX + (this.arrow.width + this.arrow.padding) / 2;
    }

    /**
     * Sets focus on the menu.
     * this.hasFocus means Arrow keys will change the selected menu item.
     * @param {boolean} [hasFocus=true]
     * @memberof ObjectMenu
     */
    setFocus(hasFocus = true) {
      this.hasFocus = hasFocus;
    }

    /**
     * Creates the menu item option Objects
     * @param {*} options
     * @memberof ObjectMenu
     */
    createOptionObjects(options) {
      this.options = options.map((option, i) => this.game.Objects.create({
        ...option,
        type: 'textInteractive',
        x: this.startX,
        y: (this.game.Canvas.height / 2) - 55 + (i * 55),
      }));
    }

    /**
     * Creates the arrow indicator
     *
     * @param {*} text
     * @param {string} [font='44px Arial']
     * @memberof ObjectMenu
     */
    createArrow(text, font = '44px Arial') {
      // get the width to offset from the menu items
      const width = this.game.Canvas.calcTextWidth(text, font);

      // get the current focus object
      // const focusMenuObject = this.getFocusMenuObject();
      
      // create the object
      this.arrow = this.game.Objects.create({
        type: 'text',
        text,
        font,
        padding: 12,
        x: this.startX - width - 12,
        y: this.focusMenuObject.y,
        width,
      });
    }

    /**
     * Gets the array index of the focused menu option by its id
     *
     * @param {*} id
     * @returns
     * @memberof ObjectMenu
     */
    getFocusMenuObjectIndexById(id) {
      return this.options.map(option => option.id).indexOf(id);
    }

    /**
     * Increments the current focused menu item
     *
     * @memberof SceneMainMenu
     */
    incrementFocusMenuObject() {
      // get the focused menu object's index in the option array
      const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

      // increment it or start back at the beginning
      this.focusMenuObject = index === (this.options.length - 1)
        ? this.options[0]
        : this.options[index + 1];
          
      // update the arrow position
      this.arrow.y = this.focusMenuObject.y;
    }

    /**
     * Decrements the current focused menu item
     *
     * @memberof SceneMainMenu
     */
    decrementFocusMenuObject() {
      // get the focused menu object's index in the option array
      const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

      // increment it or start back at the beginning
      this.focusMenuObject = index === 0
        ? this.options[this.options.length - 1]
        : this.options[index - 1];
          
      // update the arrow position
      this.arrow.y = this.focusMenuObject.y;
    }

    /**
     * Draws the menu
     *
     * @memberof ObjectMenu
     */
    draw() {
      // set the Canvas context to the menu layer
      this.game.Canvas.setContext('menu');
      this.options.forEach(option => option.draw(this.game.Canvas));

      if (this.hasFocus) {
        this.arrow.draw(this.game.Canvas);
      }
    }
  }

  /**
   * Handles Object creation for use in Scenes
   *
   * @class Objects
   */
  class Objects {
    constructor(game) {
      this.game = game;

      // Used as the object.id when creating new objects.
      // Increments after each usage.
      this.newObjectId = 0;
    }

    /**
     * Creates a new object
     *
     * @param {*} args
     * @returns A Scene Object
     * @memberof Objects
     */
    create(args) {
      // get a new object id
      this.newObjectId++;

      // create the new object args
      const object = Object.assign({}, args, {
        id: this.newObjectId,
      });

      switch (object.type) {
        case 'text':
          return new ObjectText(object)
          break;
        
        case 'textInteractive':
          return new ObjectTextInteractive(object);
          break;

        case 'circle':
          return new ObjectCircle(object);
          break;
        
        case 'menu':
          return new ObjectMenu(object, this.game);
          break;
        
        default:
          break;
      }

      return {};
    }
  }

  /**
   * Base helper class for canvas scenes
   *
   * @class Scene
   */
  class Scene {
    // constructor games the game object
    constructor(game) {
      // make the game instance available to the scene
      this.game = game;

      // easy access to the canvas and canvas context
      this.Canvas = this.game.Canvas;
      this.ctx = this.game.Canvas.ctx;

      // each access to the object factory
      this.Objects = this.game.Objects;

      // the scene contains objects to be drawn
      this.scene = [];

      // additional constructor actions for child classes
      this.init();
    }

    /**
     ** Should be declared by subclass
     *  called at the end of constructor
     *
     * @memberof Scene
     */
    init() {
      // hello from the other side
    }

    /**
     * Push an object to the scene
     *
     * @param {object} obj
     * @memberof Scene
     */
    pushToScene(obj) {
      this.scene.push(obj);
    }

    /**
     ** Should be declared by subclass
     *  What/where objects should be displayed
     *
     * @memberof Scene
     */
    prepareScene() {
      /* for example
      if (this.shouldShowObject) {
        this.pushToScene(this.obj);
      }
      */
    }

    /**
     * Calls the .draw() method of each object in the scene
     * 
     *
     * @memberof Scene
     */
    drawSceneToCanvas() {
      // draw each object in the scene
      this.scene.forEach(obj => {
        obj.draw(this.Canvas);
      });

      // clear the scene for the next frame
      this.scene = [];
    }

    /**
     * Draws the current scene
     * Called in the main game loop
     *
     * @memberof Scene
     */
    draw() {
      // push the scene objects to the scene array
      this.prepareScene();

      // call each object's draw method
      this.drawSceneToCanvas();
    }

    /**
     ** Should be overridden by subclass
     *  Clears the previous frame
     *
     * @memberof Scene
     */
    clear() {
      // hello from the other side
    }

    /**
     ** Should be overridden by subclass
     *  Handles input from keyboard/mouse
     *
     * @memberof Scene
     */
    handleInput() {
      // hello from the other side
    }

    /**
     * Handle scene transitions
     *
     * @memberof Scene
     */
    transitionIn() {
      // disable and reenable keyboard on scene transition
      this.game.Keyboard.setDisabled();
      this.game.Keyboard.clear();
      setTimeout(() => {
        this.game.Keyboard.setDisabled(false);
      }, 150);

      // do custom transition in effects
      this.transitionInCustom();
    }

    /**
     ** Should be overridden by subclass
     *  Give the scene a way to customize the transition in
     *
     * @memberof Scene
     */
    transitionInCustom() {
      // hello from the other side
    }

    /**
     * Transition out of the current scene
     *
     * @memberof Scene
     */
    transitionOut() {
      // default to clear all layers
      for (let i = 0; i < this.game.Canvas.layers.length; i++) {
        this.game.Canvas.layers[i].clear();
      }
    }
  }

  /**
   * The Main Menu scene
   *
   * @class SceneMainMenu
   * @extends {Scene}
   */
  class SceneMainMenu extends Scene {
    /**
     * Constructor
     *
     * @memberof SceneMainMenu
     */
    init() {
      // create the logo object
      this.createLogo();

      // create the menu objects
      // this.createMenuObjects();

      //
      this.createMenu();

      // keyboard input stuff
      this.allowInput = true;
      this.keyboardCooldown = 150;
      this.keyboardCooldownTimer;
    }

    /**
     * Creates the logo object
     *
     * @memberof SceneMainMenu
     */
    createLogo() {
      const text = 'Canvas Game Engine';
      const font = '44px Arial';
      this.logo = this.Objects.create({
        type: 'text',
        text,
        x: this.Canvas.calcCenteredTextX(text, font),
        y: 64 + this.Canvas.padding,
        font,
      });
    }

    /**
     * Creates the menu
     *
     * @memberof SceneMainMenu
     */
    createMenu() {
      this.menu = this.Objects.create({
        type: 'menu',
        options: [
          {
            text: 'New Game',
            callback: () => {
              this.game.setScene('game');
            },
          },
          {
            text: 'Continue',
            callback: () => {
              console.log('do Continue');
            },
          },
          {
            text: 'Options',
            callback: () => {
              console.log('do Options');
            },
          },
        ]
      });
    }

    /**
     * Clear the text layer
     *
     * @memberof SceneMainMenu
     */
    clear() {
      this.Canvas.getLayerByName('menu').clear();
    }

    /**
     * Loads the objects to the scene for drawing
     *
     * @memberof SceneMainMenu
     */
    prepareScene() {
      // draw the background
      this.Canvas.setContext('primary');
      this.Canvas.drawGradientBackground();

      this.Canvas.setContext('menu');

      // push the logo to the scene
      this.pushToScene(this.logo);

      // push the menu to the scene
      this.pushToScene(this.menu);
    }

    /**
     * Handle input for the scene
     *
     * @param {array} activeKeys
     * @returns {void}
     * @memberof SceneMainMenu
     */
    handleInput(Keyboard) {
      if (!this.allowInput) {
        return;
      }

      // handle up
      if (Keyboard.active.up) {
        // decrement the focused object
        this.menu.decrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle down
      if (Keyboard.active.down) {
        // increment the focused object
        this.menu.incrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle enter
      if (Keyboard.active.enter) {
        // do the menu item callback
        this.menu.focusMenuObject.callback();
        this.allowInput = false;
      }
      
      // set timeout to enable key press again
      window.clearTimeout(this.keyboardCooldownTimer);
      const that = this;
      this.keyboardCooldownTimer = window.setTimeout(function() {
        that.allowInput = true;
      }, this.keyboardCooldown);
    }

    transitionInCustom() {
      // TODO: fix this nonsense...
      this.game.Canvas.clearLayers(['menu', 'secondary', 'override', 'shadow']);
    }

    transitionOut() {
      // clear the menu layer
      this.game.Canvas.getLayerByName('menu').clear();
    }
  }

  /**
   * Contains descriptive properties of the map for all map classes to extend from
   *
   * @class MapBaseClass
   */
  class MapBaseClass {
    constructor(game, map) {
      this.game = game;
      this.map = map;
      this.Canvas = game.Canvas;
      this.Objects = game.Objects;
      
      // map and tile description
      this.xTiles = 50;
      this.yTiles = 50;
      this.totalTiles = this.xTiles * this.yTiles;
      this.tileWidth = 50;
      this.tileHeight = 50;
      this.pixelWidth = this.xTiles * this.tileWidth;
      this.pixelHeight = this.yTiles * this.tileHeight;

      this.init();
    }

    /**
     * Gets a random tile coordinate
     *
     * @returns
     * @memberof MapBaseClass
     */
    getRandomTileCoordinate() {
      // get random tile coords
      const x = Math.round(Math.random() * this.xTiles);
      const y = Math.round(Math.random() * this.yTiles);

      return { x, y }
    }

    /**
     * Gets a random pixel coordinate
     *
     * @returns
     * @memberof MapBaseClass
     */
    getRandomPixelCoordinate() {
      // get random pixel coords
      const x = Math.round(Math.random() * this.pixelWidth);
      const y = Math.round(Math.random() * this.pixelHeight);

      return { x, y };
    }

    /**
     * Subclass constructor
     *
     * @memberof MapBaseClass
     */
    init() {
      // 
    }
  }

  /**
   * Provides utility methods for tiles
   *
   * @class TileUtil
   */
  class TileUtil extends MapBaseClass {
    /**
     * Creates an instance of TileUtil.
     * @param {number} [tileInt=0]
     * @memberof TileUtil
     */
    init(args) {
      // define substr positions for extracting tile data
      this.substr = {
        type: 1,
        blocking: 2,
        light: 3,
        shadow: 4,
        x: 5,
        y: 5 + this.xMax,
      };
    }

    /**
     * Converts x, y position to map array index
     *
     * @param {*} x
     * @param {*} y
     * @param {boolean} [convertPixels=false]
     * @returns
     * @memberof Map
     */
    convertPosToIndex(x, y, convertPixels = false) {
      let tileX = x;
      let tileY = y;
      
      if (convertPixels) {
        tileX = Math.round(x / this.tileWidth);
        tileY = Math.round(y / this.tileHeight);
      }

      const index = tileX + tileY * this.yTiles;
      return index;
    }

    /**
     * Creates a map tile
     *
     * @param {*} args
     * @returns
     * @memberof TileUtil
     */
    create(args = {}) {
      // defaults
      let type = 0;
      let blocking = 0;
      let light = 0;
      let shadow = 0;

      // randomize the tile type
      let random = Math.random();
      if (random > .1) {
        type = 0; // grass
      } else if (random > 0) {
        type = 1; // water;
        blocking = 1;
      } // else {
      //   type = 2; // rock
      //   blocking = 1;
      //   shadow = 1;
      // }

      // null is 0 bytes, woohoo! (grass)
      if (type === 0) {
        return null;
      }

      // (water)
      if (type === 1) {
        return '1';
      }

      // '' is 0 bytes too, woohoo (rock)
      if (type === 2) {
        return '';
      }

      // create and return the string
      const string = '1' + type + '' + blocking + '' + light + '' + shadow + '';
      return Number(string);
    }

    /**
     * Converts a packed tile integer into a verbose object
     *
     * @param {*} int
     * @returns
     * @memberof TileUtil
     */
    unpack(int) {
      // if int is not an int, it's an aliased value
      if (typeof int !== 'number') {
        // TODO: Look into why i have to explicitly do this and can't use reference array
        if (int === null) return {
          type: 'grass',
          blocking: false,
          shadow: false,
          light: false,
        };

        if (int === '1') return {
          type: 'water',
          blocking: true,
          shadow: false,
          light: false,
        }

        if (int === '') return {
          type: 'rock',
          blocking: true,
          shadow: true,
          light: false,
        }
      }

      // convert the int to a string
      const raw = this.toString(int);

      // get the properties
      const type = tileTypes[raw.substr(this.substr.type, 1)].type;
      const blocking = Number(raw.substr(this.substr.blocking, 1)) === 1;
      const light = Number(raw.substr(this.substr.light, 1)) === 1;
      const shadow = Number(raw.substr(this.substr.shadow, 1)) === 1;
      // const x = Number(raw.substr(this.substr.x, this.xMax));
      // const y = Number(raw.substr(this.substr.y, this.yMax));
      // const xPixel = x * this.tileWidth;
      // const yPixel = y * this.tileHeight;
      // const width = this.tileWidth;
      // const height = this.tileHeight;

      const tile = {
        type,
        blocking,
        light,
        shadow,
        // x,
        // y,
        // xPixel,
        // yPixel,
        // width,
        // height,
      };

      return tile;
    }

    /**
     * Converts an int to string
     *
     * @param {*} int
     * @returns
     * @memberof TileUtil
     */
    toString(int) {
      return int + "";
    }

    /**
     * Get the type integer
     *
     * @returns {integer} type
     * @memberof TileUtil
     */
    typeInt(int) {
      return Number(this.toString(int).substr(this.substr.type, 1));
    }

    /**
     * Get the human readable tile type
     *
     * @returns
     * @memberof TileUtil
     */
    typeText(int) {
      const index = this.typeInt(int);
      return tileTypes[index].type;
    }

    /**
     * Get the X map position
     *
     * @returns
     * @memberof TileUtil
     */
    // x(int) {
    //   const x = Number(this.toString(int).substr(this.substr.x, this.xMax));
    //   return x;
    // }

    /**
     * * Get the Y map position
     *
     * @returns
     * @memberof TileUtil
     */
    // y(int) {
    //   const y = Number(this.toString(int).substr(this.substr.y, this.yMax));
    //   return y;
    // }

    /**
     * Check if the tile is blocking
     *
     * @returns {boolean} is blocking
     * @memberof TileUtil
     */
    blocking(int) {
      return Number(this.toString(int).substr(this.substr.blocking, 1)) === 1;
    }

    /**
     * Check if the tile casts a shadow
     *
     * @returns
     * @memberof TileUtil
     */
    shadow(int) {
      return Number(this.toString(int).substr(this.substr.shadow, 1)) === 1;
    }
  }

  const itemList = [
    {
      name: 'rock',
      blocking: true,
      shadow: true,
      light: false,
      width: 50,
      height: 50,
      spawnRate: .1,
      snapToGrid: true,
      draw(Canvas) {
        const x = this.x + Canvas.Camera.offsetX;
        const y = this.y + Canvas.Camera.offsetY;
        
        this.mesh.position.x = x - Canvas.Camera.width / 2 + 25;
        this.mesh.position.y = y - Canvas.Camera.height / 2 + 25;
        this.mesh.position.z = 0;

        const ctx = Canvas.overrideLayer.context;
        ctx.fillStyle = '#888787';
        ctx.fillRect(x, y, this.width, this.height);
        // Canvas.roundRect(ctx, x, y, this.width, this.height, 20, '#888787', 0);
      },
      createMesh() {
        const material = new THREE.MeshPhongMaterial({
          color: 0x333333,
          opacity: 0,
          transparent: true,
        });
        const depth = 50;
        const geometry = new THREE.BoxGeometry( this.width, this.height, depth );
        this.mesh = new THREE.Mesh( geometry, material );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
      },
    },
    {
      name: 'torch',
      blocking: false,
      shadow: false,
      light: true,
      width: 10,
      height: 10,
      spawnRate: .01,
      snapToGrid: false,
      draw(Canvas) {
        const x = this.x + Canvas.Camera.offsetX;
        const y = this.y + Canvas.Camera.offsetY;
        const radius = 10;
        const startAngle = Math.PI / 180 * 0;
        const endAngle = Math.PI / 180 * 360;
        const anticlockwise = false;
        
        const ctx = Canvas.primaryLayer.context;

        ctx.fillStyle = 'rgba(255, 155, 0, 1)';
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        ctx.fill();
        // this.ctx.strokeStyle = '#500050';
        // this.ctx.lineWidth = 1;
        // this.ctx.stroke();
        ctx.closePath();
      },
    },
  ];

  class Items extends MapBaseClass {
    init() {
      // holds all items currently on the map
      this.array = [];
      this.visible = [];

      // reference the item list
      this.itemList = itemList;
    }

    generateItems() {
      // generate items for the map
      for (var i = 0; i < this.totalTiles; i++) {
        for (var j = 0; j < this.itemList.length; j++) {
          const item = this.itemList[j];

          const shouldSpawn = item.spawnRate > Math.random();
          
          if (shouldSpawn) {
            let x, y;

            if (item.snapToGrid) {
              const tile = this.getRandomTileCoordinate();
              x = tile.x * this.tileWidth;
              y = tile.y * this.tileHeight;
            } else {
              const coords = this.getRandomPixelCoordinate();
              x = coords.x;
              y = coords.y;
            }
            
            const Item = Object.assign({}, item, { x, y });
            if (typeof Item.createMesh !== 'undefined') {
              // create the three.js mesh for this object
              Item.createMesh();
            }

            this.array.push(Item);
          }
        }
      }
    }

    draw(Canvas) {
      for (var i = 0; i < this.visible.length; i++) {
        const item = this.visible[i];
        item.draw(Canvas);
      }
    }

    /**
     * Calculate visible characters
     *
     * @param {*} inViewport
     * @memberof Characters
     */
    calculateVisible() {
      const visible = [];

      for (var i = 0; i < this.array.length; i++) {
        const item = this.array[i];
        if (this.Canvas.Camera.inViewport(item.x, item.y, item.x + item.width, item.y + item.height)) {
          visible.push(item);

          if (typeof item.mesh !== 'undefined') {
            this.Canvas.Shadows.scene.add(item.mesh);
          }
        } else {
          if (typeof item.mesh !== 'undefined') {
            this.Canvas.Shadows.scene.remove(item.mesh);
          }
        }
      }

      this.visible = visible;
    }
  }

  /**
   * The character base class
   * keeps track of the characters individual easing to position
   *
   * @class CharacterBaseClass
   */
  class CharacterBaseClass {
    constructor(game, map, args) {
      // display debug info
      this.debug = true;

      // handle args
      this.game = game;
      this.map = map;
      this.id = args.id;
      this.x = args.x;
      this.y = args.y;
      this.width = 50;
      this.height = 50;
      this.blocking = true;

      // player input handling
      this.isPlayer = false;
      this.allowInput = true;

      // if the hero can move in a certain direction
      // [ up, right, down, left ];
      this.canMove = [true, true, true, true];

      // handle character's directional velocity
      this.velocities = [0, 0, 0, 0];
      
      //this.maxSpeed = 18;
      this.maxSpeed = Math.round(Math.random() * 50);

      this.rateOfIncrease = 1 + this.maxSpeed / 100;
      this.rateOfDecrease = 1 + this.maxSpeed;

      // set target x,y for easing the character movement
      this.targetX = this.x;
      this.targetY = this.y;
      this.targetXTimer;
      this.targetYTimer;

      // cooldown beteween movement
      this.inputCooldown = 30;

      // movement timer
      this.isVisible = false;
      this.npcMovementTimer;
      this.doMovement();

      // image
      this.image = new Image(50, 50);
      this.image.src = this.game.Canvas.createImage();

      this.init(args.map);
    }

    doMovement() {
      // bail if controlled by human
      if (this.isPlayer) {
        return;
      }

      // bail if not visible
      if (!this.isVisible) {
        return;
      }    
      
      window.clearTimeout(this.npcMovementTimer);
      const msTilNextMove = Math.random() * 1000;
      this.npcMovementTimer = window.setTimeout(() => {
        // get some potential target vals
        const targetX = (Math.random() * 4 - 2) * this.maxSpeed;
        const targetY = (Math.random() * 4 - 2) * this.maxSpeed;
      

        this.targetX = this.x + targetX;
        this.targetXTimerHandler(targetX > 0 ? 1 : 3);
        this.targetY = this.y + targetY;
        this.targetYTimerHandler(targetY > 0 ? 2 : 0);

        this.doMovement();
      }, msTilNextMove);
    }

    stopMovement() {
      window.clearTimeout(this.npcMovementTimer);
      this.targetY = this.y;
      this.targetX = this.x;
      window.clearTimeout(this.targetXTimer);
      window.clearTimeout(this.targetYTimer);
    }

    /**
     * Subclass constructor
     *
     * @param {*} map
     * @memberof CharacterBaseClass
     */
    init(map) {
      
    }

    /**
     * Currently draws a circle
     *
     * @param {*} Canvas
     * @memberof Hero
     */
    draw(Canvas) {
      Canvas.setContext('character');

      Canvas.drawCharacter({
        image: this.image,
        x: this.x,
        y: this.y,
        width: 50,
        height: 50,
      });
    }

    /**
     * Increases the hero.maxSpeed
     *
     * @memberof Hero
     */
    increaseSpeed() {
      this.maxSpeed++;
    }

    /**
     * Decreases the hero.maxSpeed
     *
     * @memberof Hero
     */
    decreaseSpeed() {
      this.maxSpeed--;
    }

    /**
     * Handles easing on the X axis
     *
     * @param {*} dir
     * @param {*} this.map
     * @memberof Hero
     */
    targetXTimerHandler(dir) {
      // clear the existing timer
      clearTimeout(this.targetXTimer);

      // get the difference between the current y and the target y
      let difference = Math.abs(this.x - this.targetX);

      // set a new timer
      this.targetXTimer = setTimeout(() => {
        // calculate what the new x should be
        const newX = dir === 1 // right
          ? this.x + (difference / this.inputCooldown)
          : this.x - (difference / this.inputCooldown); 

        // handle collision
        const collision = this.map.getCollision(newX, this.y);

        if (collision) {
          this.targetX = this.x;
          difference = 0;
        } else {
          this.x = newX;
        }

        this.afterEaseMovement();

        // if we're not close enough to the target Y, keep moving
        if (difference > 1) {
          this.targetXTimerHandler(dir, this.map);
        }
      }, difference / this.inputCooldown);
    }

    /**
     * Handles easing on the Y axis
     *
     * @param {*} dir
     * @memberof Hero
     */
    targetYTimerHandler(dir) {
      // clear the existing timer
      clearTimeout(this.targetYTimer);

      // get the difference between the current y and the target y
      let difference = Math.abs(this.y - this.targetY);

      // set a new timer
      this.targetYTimer = setTimeout(() => {
        // handle direction
        const newY = dir === 0 // up
          ? this.y - (difference / this.inputCooldown)
          : this.y + (difference / this.inputCooldown);

        // handle collision
        const collision = this.map.getCollision(this.x, newY);

        if (collision) {
          this.targetY = this.y;
          difference = 0;
        } else {
          this.y = newY;
        }

        this.afterEaseMovement();

        // if we're not close enough to the target Y, keep moving
        if (difference > 1) {
          this.targetYTimerHandler(dir, this.map);
        } else {
          this.map.needsUpdate = false;
        }
      }, difference / this.inputCooldown);
    }

    /**
     * Additional actions to perform after movement easing is calculated
     *
     * @memberof Hero
     */
    afterEaseMovement() {
      if (this.id === this.map.heroId) {
        // calculate
        this.game.Canvas.Camera.setFocus({
          x: this.x,
          y: this.y,
        });
      }

      this.map.needsUpdate = true;
    }

    /**
     * Handle input for the hero
     *
     * @param {*} activeKeys
     * @param {*} this.map
     * @returns
     * @memberof Hero
     */
    handleInput(Keyboard) {
      // bail if input is disabled
      if (!this.allowInput) {
        return;
      }

      if (Keyboard.active.plus) {
        this.increaseSpeed();
      }

      if (Keyboard.active.minus) {
        this.decreaseSpeed();
      }

      // loop through each directions
      for (let i = 0; i < Keyboard.directions.length; i++) {
        // is the direction active?
        const active = Keyboard.directions[i];

        // if direction is active
        if (active) {
          this.canMove[i] = false;
          
          // make it faster
          this.velocities[i] = this.velocities[i] >= this.maxSpeed
            ? this.maxSpeed
            : (this.velocities[i] + 1) * this.rateOfIncrease;
          
          // y axis
          if (i === 0 || i === 2) {
            // opposite directions cancel eachother out
            if (!(Keyboard.active.up && Keyboard.active.down)) {
              this.targetY = i === 0
                ? this.y - this.velocities[i] // up
                : this.y + this.velocities[i]; // down
              
              this.targetYTimerHandler(i);
            } else {
              this.velocities[i] = 0;
            }
          }

          // x axis
          if (i === 1 || i === 3) {
            // opposite directions cancel eachother out
            if (!(Keyboard.active.left && Keyboard.active.right)) {
              this.targetX = i === 1
                ? this.x + this.velocities[i] // right
                : this.x - this.velocities[i]; // left
              
              this.targetXTimerHandler(i);
            } else {
              this.velocities[i] = 0;
            }
          }
        } else {
          // nuke velocity if not active
          this.velocities[i] = 0;
        }
      }
      
      // set timeout to enable movement in the direction
      clearTimeout(this.keyboardCooldownTimer);
      this.keyboardCooldownTimer = setTimeout(() => {
        this.canMove = [true, true, true, true];
      }, this.inputCooldown);
    }
  }

  class Characters extends MapBaseClass {
    /**
     * Subclass constructor
     *
     * @memberof CharUtil
     */
    init() {
      // holds all characters
      this.array = [];
      this.visible = [];

      // used to give each character a unique id
      this.ids = 0;

      // a list of all character types
      this.types = [
        {
          name: 'hero',
        }
      ];
    }

    draw(Canvas) {
      for (var i = 0; i < this.visible.length; i++) {
        this.visible[i].draw(Canvas);
      }
    }

    getById(id) {
      for (var i = 0; i < this.array.length; i++) {
        if (this.array[i].id === id) {
          return this.array[i];
        }
      }

      throw `CharacterUtil.getById: character with id does not exist: ${id}`;
    }

    /**
     * Gets a type by its name
     *
     * @param {*} name
     * @returns
     * @memberof CharUtil
     */
    getTypeByName(name) {
      for (var i = 0; i < this.types.length; i++) {
        if (this.types[i].name === name) {
          return this.types[i];
        }
      }

      throw `CharacterUtil.getTypeByName: name does not exist: ${name}`;
    }

    /**
     * Character creation method
     *
     * @memberof CharUtil
     */
    create(type, x, y) {
      const id = this.ids++;
      const args = { type, x, y, id };
      const character = new CharacterBaseClass(this.game, this.map, args);
      this.array.push(character);
      return id;
    }

    /**
     * Generates a random character
     *
     * @memberof CharUtil
     */
    generateRandom() {
      const { x, y } = this.getRandomPixelCoordinate();
      this.create('hero', x, y);
    }

    /**
     * Calculate visible characters
     *
     * @param {*} inViewport
     * @memberof Characters
     */
    calculateVisible(inViewport) {
      const visible = [];

      for (var i = 0; i < this.array.length; i++) {
        const x1 = this.array[i].x;
        const y1 = this.array[i].y;
        const x2 = x1 + this.array[i].width;
        const y2 = y1 + this.array[i].height;
        if (this.Canvas.Camera.inViewport(x1, y1, x2, y2)) {
          this.array[i].isVisible = true;
          this.array[i].doMovement();
          visible.push(this.array[i]);
        } else {
          this.array[i].stopMovement();
          this.array[i].isVisible = false;
        }
      }

      this.visible = visible;
    }
  }

  class Shadows$1 {
    constructor(Canvas, origin, objects) {
      this.Canvas = Canvas;

      // set the context to the shadow layer
      this.ctx = this.Canvas.shadowLayer.context;

      // origin point where lighting is based off of, which is always the hero x/y
      this.origin = {
        x: origin.x + 25,
        y: origin.y + 25,
      };

      // get all blocking objects
      this.blocks = [];
      this.lights = [];

      for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        const x1 = object.x;
        const y1 = object.y;
        const block = {
          x1: object.x,
          y1: object.y,
          x2: object.x + object.width,
          y2: object.y + object.height,
          width: object.width,
          height: object.height,
        };

        if (object.shadow) {
          this.blocks.push(block);
        }

        // TODO: Add light handling
        if (object.light === true) {
          this.lights.push(block);
        }
      }
    }

    draw() {
      this.Canvas.shadowLayer.clear();

      // get the camera offset
      const offsetX = this.Canvas.Camera.offsetX;
      const offsetY = this.Canvas.Camera.offsetY;

      this.ctx.globalCompositeOperation = 'source-over';

      // gradient 1
      const grd = this.ctx.createRadialGradient(
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        0,
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        360
      );
      
      grd.addColorStop(0, 'rgba(0, 0, 0, .1)');
      grd.addColorStop(0.9, 'rgba(0, 0, 0, .5');
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

      // gradient 2
      this.ctx.globalCompositeOperation = 'source-over';
      const grd2 = this.ctx.createRadialGradient(
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        0,
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        360
      );
      grd2.addColorStop(0, 'rgba(0, 0, 0, .1)');
      grd2.addColorStop(0.9, 'rgba(0, 0, 0, 1');
      this.ctx.fillStyle = grd2;
      this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

      // lights
      this.ctx.globalCompositeOperation = 'destination-out';
      this.lights.forEach(light => {
        const gradient = this.ctx.createRadialGradient(
          light.x1 + offsetX + light.width / 2,
          light.y1 + offsetY + light.height / 2,
          0,
          light.x1 + offsetX + light.width / 2,
          light.y1 + offsetY + light.height / 2,
          100
        );
        gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.random() + .7})`);
        gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
          light.x1 + offsetX - 100 + light.width / 2,
          light.y1 + offsetY - 100 + light.height / 2,
          200,
          200
        );
      });

      // object shadows
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = '1px';

      for (let i = 0; i < this.blocks.length; i++) {
        const pos = this.blocks[i];

        // get all 4 corners
        const points = [
          { x: pos.x1, y: pos.y1 },
          { x: pos.x2, y: pos.y1 },
          { x: pos.x1, y: pos.y2 },
          { x: pos.x2, y: pos.y2 },
        ];

        // this.drawShadows(points, pos, offsetX, offsetY);
      }
    }

    drawShadows(points, pos, offsetX, offsetY) {
      
      this.ctx.globalCompositeOperation = 'source-over';
      
      // calculate the angle of each line
      const raw = points.map(point => Object.assign({}, point, {
        angle: this.calculateAngle(point),
        distance: this.calculateDistance(point),
      }));

      const minMaxDistance = 1000;

      const angles = raw.slice(0).sort((a, b) => {
        // sort by angle
        if (b.angle > a.angle) {
          return 1;
        }

        if (b.angle < a.angle) {
          return -1;
        }

        return 0;
      });

      const furthest = raw.slice(0).sort((a, b) => {
        // sort by angle
        if (b.distance > a.distance) {
          return 1;
        }

        if (b.distance < a.distance) {
          return -1;
        }

        return 0;
      });
      
      // TODO: Don't read this next block of code
      // TODO: it's just a bunch of spaghett
      this.ctx.fillStyle = `rgb(0, 0, 0)`;
      this.ctx.beginPath();
      if (
        this.origin.x > pos.x2
        && this.origin.y > pos.y1
        && this.origin.y < pos.y2
      ) {
        let min = this.calculatePoint(angles[2].angle, minMaxDistance);
        let max = this.calculatePoint(angles[1].angle, minMaxDistance);
        this.ctx.moveTo(angles[1].x + offsetX, angles[1].y + offsetY);
        this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
        this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
        this.ctx.lineTo(angles[2].x + offsetX, angles[2].y + offsetY);
        if (this.origin.y > pos.y1 + pos.width / 2) {
          this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
        } else {
          this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
          this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
        }
        this.ctx.lineTo(angles[1].x + offsetX, angles[1].y + offsetY);
      } else {
        if (
          this.origin.y > pos.y1
          && this.origin.y < pos.y2
        ) {
          // handle being left of the object
          const max = this.calculatePoint(angles[0].angle, minMaxDistance);
          const min = this.calculatePoint(angles[3].angle, minMaxDistance);
          this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
          this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
          this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
          this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
          if (this.origin.y > pos.y1 + pos.width / 2) {
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
          } else {
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          }
          this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
        } else if ( // above/beneath object
          this.origin.x > pos.x1
          && this.origin.x < pos.x2
        ) {
          // below the object
          if (this.origin.y > pos.y1) {
            // below the object
            const max = this.calculatePoint(angles[0].angle, minMaxDistance);
            const min = this.calculatePoint(angles[3].angle, minMaxDistance);
            this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
            this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
            this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
            this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
            if (this.origin.x > pos.x1 + pos.width / 2) {
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            } else {
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            }
            this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
          } else { // above the object
            // below the object
            const max = this.calculatePoint(angles[0].angle, minMaxDistance);
            const min = this.calculatePoint(angles[3].angle, minMaxDistance);
            this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
            this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
            this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
            this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
            if (this.origin.x > pos.x1 + pos.width / 2) {
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            } else {
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            }
            this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
          }
        } else { // northwest of object
          const max = this.calculatePoint(angles[0].angle, minMaxDistance);
          const min = this.calculatePoint(angles[3].angle, minMaxDistance);
          this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
          this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
          this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
          this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
          this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();
    }

    /**
     * Calculates the angle between 2 points
     *
     * @param {*} point
     * @param {*} [origin={ x: this.origin.x, y: this.origin,y }]
     * @returns
     * @memberof Shadows
     */
    calculateAngle(point, origin = { x: this.origin.x, y: this.origin.y }) {
      return Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI;
    }

    /**
     * Calculates a new point given an angle, distance from, and starting point
     *
     * @param {*} angle
     * @param {*} distance
     * @returns {object} x, y
     * @memberof Shadows
     */
    calculatePoint(angle, distanceFrom, point = { x: this.origin.x, y: this.origin.y }) {
      return {
        x: Math.round(Math.cos(angle * Math.PI / 180) * distanceFrom + point.x),
        y: Math.round(Math.sin(angle * Math.PI / 180) * distanceFrom + point.y),
      };
    }

    /**
     * Calculate the distance between two points
     * AKA Pythagorean theorem
     *
     * @param {*} pos1
     * @param {*} pos2
     * @returns
     * @memberof Shadows
     */
    calculateDistance(pos1, pos2 = { x: this.origin.x, y: this.origin.y }) {
      const a = pos1.x - pos2.x;
      const b = pos1.y - pos2.y;

      // return the distance
      return Math.sqrt(a * a + b * b);
    }
  }

  /**
   * @class Map
   * 
   *  Types of information stored in the Map class are
   *    - Tiles
   *    - Items
   *    - Characters
   *
   *  All of the above types are stored in their each respective array
   *  keyed by the map coordinates [ x + (y * xWidth)]
   *
   *  Map has a property hero which is a reference to a character
   *  in the character array, and is controlled by user input
   *
   */
  class Map extends MapBaseClass {
    init() {
      // debug mode on
      this.debug = true;

      // class utilites
      this.Tile = new TileUtil(this.game);
      this.Items = new Items(this.game);
      this.Characters = new Characters(this.game, this);

      // stores the data about what exists at a particular position
      this.mapArray = [];

      // keep track of visible tiles
      this.visibleTilesPerDirection = 16;
      this.visibleTileArray = [];
      this.visibleTileX = 0;
      this.visibleTileY = 0;

      this.generateCharacters();
      this.generateItems();
    }

    /**
     * Generates the characters on the map and sets the player's character
     *
     * @memberof Map
     */
    generateCharacters() {
      // and some random characters
      for (var i = 0; i < 100; i++) {
        this.Characters.generateRandom();
      }

      // put them in random locations on the map
      for (var i = 0; i < this.Characters.array.length; i++) {
        this.moveObjectToRandomLocation(this.Characters.array[i], false);
      }

      // set the hero to the first generated character
      this.setHeroCharacter(0);
    }

    /**
     * Changes the player's hero character to the specified id
     *
     * @param {*} id
     * @memberof Map
     */
    setHeroCharacter(id) {
      this.heroId = id;

      if (id >= this.Characters.array.length) {
        this.heroId = 0;
      }

      // change previous hero to npc
      if (typeof this.hero !== 'undefined') {
        this.hero.isPlayer = false;
        this.hero.doMovement();
      }

      this.hero = this.Characters.getById(this.heroId);
      this.hero.isPlayer = true;

      // set focus to hero
      this.Canvas.Camera.x = this.hero.x;
      this.Canvas.Camera.y = this.hero.y;
      this.Canvas.Camera.setFocus(this.hero);

      this.needsUpdate = true;
    }

    /**
     * Generate items for the map
     *
     * @memberof Map
     */
    generateItems() {
      this.Items.generateItems();
    }

    /**
     * Gets a random x/y coord
     *
     * @memberof Hero
     */
    moveObjectToRandomLocation(object, needsUpdate = true) {
      // get random pixel coordinate
      const { x, y } = this.getRandomPixelCoordinate();

      // calculate visible tiles so we can check for collisions
      this.calculateVisibleTiles(x, y);

      // check if blocking, try again if so
      if (this.getCollision(x, y)) {
        return this.moveObjectToRandomLocation(object, needsUpdate);
      }

      // clear existing movements
      clearTimeout(object.targetXTimer);
      clearTimeout(object.targetYTimer);
      object.targetX = x;
      object.targetY = y;
      object.x = x;
      object.y = y;

      // extra handling if it is the hero
      if (this.heroId === object.id) {
        // set the camera focus
        this.Canvas.Camera.setFocus({ x, y }, true);

        // tell the map to redraw
        this.needsUpdate = needsUpdate;
      }
    }

    /**
     * Draws the map tiles and shawdows
     * only if the map needs an update
     *
     * @param {*} Canvas
     * @memberof Map
     */
    draw(Canvas) {
      if (this.needsUpdate) {
        // calculate everything that's visible
        this.calculateVisible();

        // draw the tiles
        for (var i = 0; i < this.visibleTileArray.length; i++) {
          const tile = this.visibleTileArray[i];
          Canvas.drawTile(tile);
        }

        // draw the items
        this.Items.draw(Canvas);

        // draw the characters
        this.Characters.draw(Canvas);

        this.Canvas.Shadows.draw(this.Canvas);
        this.Canvas.Shadows2.draw();

        // draw the shadows
        // this.drawShadows();

        if (this.debug) {	
          Canvas.pushDebugText('hero.id', `Hero.id: ${this.hero.id}`);	
          Canvas.pushDebugText('hero.maxSpeed', `Hero.maxSpeed: ${this.hero.maxSpeed}`);	
          Canvas.pushDebugText('visibleCharacters', `Visible Characters: ${this.Characters.visible.length}`);
          Canvas.pushDebugText('visibleItems', `Visible Items: ${this.Items.visible.length}`);
        }
      }
    }

    /**
     * Draws the shadows
     *
     * @memberof Map
     */
    drawShadows() {
      // get the origin
      const scene = this.game.scene;
      const origin = { x: this.hero.x, y: this.hero.y };

      const objectsToCheck = [
        // ...this.visibleTileArray,
        ...this.Items.array,
        ...this.Characters.array,
      ];

      // get the shadow objects
      const blocks = [];
      for (var i = 0; i < objectsToCheck.length; i++) {
        const object = objectsToCheck[i];
        if (
          object.shadow
          || object.light
        ) {
          blocks.push(object);
        }
      }

      // get and draw
      const shadows = new Shadows$1(this.game.Canvas, origin, blocks);
      shadows.draw();
    }

    calculateVisible() {
      // calculate the visible tiles
      this.calculateVisibleTiles();

      // calculate the visible characters
      this.Characters.calculateVisible();

      // calculate the visible items
      this.Items.calculateVisible();
    }

    /**
     * Gets the visible tile array based off x, y coords
     *
     * @param {*} x
     * @param {*} y
     * @memberof Map
     */
    calculateVisibleTiles(x = this.game.Canvas.Camera.x, y = this.game.Canvas.Camera.y) {    
      // get the pixel to tile number
      const tileX = Math.round(x / this.tileWidth);
      const tileY = Math.round(y / this.tileHeight);

      // bail if the tiles are the same as the last time
      if (
        this.visibleTileX === tileX
        && this.visibleTileY === tileY
      ) {
        return;
      }

      this.visibleTileX = tileX;
      this.visibleTileY = tileY;

      // get the bounds of the visible tiles
      let x1 = tileX - this.visibleTilesPerDirection;
      let x2 = tileX + this.visibleTilesPerDirection;
      let y1 = tileY - this.visibleTilesPerDirection;
      let y2 = tileY + this.visibleTilesPerDirection;

      // clamp the bounds
      if (x1 < 1) {
        x1 = 0;
      }
      if (x2 > this.xTiles) {
        x2 = this.xTiles;
      }
      if (y1 < 1) {
        y1 = 0;
      }
      if (y2 > this.yTiles) {
        y2 = this.yTiles;
      }

      // create visible tile array from the boundaries
      this.visibleTileArray = [];
      let visibleIndex = 0;
      for (let j = y1; j < y2; j++) {
        for (let i = x1; i < x2; i++) {
          // get the map array and visible array indexes
          const mapIndex = this.Tile.convertPosToIndex(i, j);

          // if the map array value is -1
          // then it has not been visible yet
          // create a tile at that index
          if (typeof this.mapArray[mapIndex] === 'undefined') {
            const tile = this.Tile.create();
            this.mapArray[mapIndex] = tile;
          }

          // add the x/y data to the object
          const visibleTile = this.Tile.unpack(this.mapArray[mapIndex]);
          visibleTile.xTile = i;
          visibleTile.yTile = j;
          visibleTile.x = i * this.tileWidth;
          visibleTile.y = j * this.tileHeight;
          visibleTile.width = this.tileWidth;
          visibleTile.height = this.tileHeight;

          // add the unpacked version of the tile to the visible tile array
          this.visibleTileArray[visibleIndex++] = visibleTile;
        }
      }
    }

    /**
     * Check if a coordinate is a collision and return the collision boundaries
     *
     * @param {*} x pixel position
     * @param {*} y pixel position
     * @returns
     * @memberof Map
     */
    getCollision(x, y) {
      // hardcode the hero
      const x1 = x + 10;
      const x2 = x + 40;
      const y1 = y + 10;
      const y2 = y + 40;
      
      // map boundaries
      if (
        x1 < 0
        || y1 < 0
        || x2 > this.pixelWidth
        || y2 > this.pixelHeight
      ) {
        return true;
      }

      const objectsToCheck = [
        ...this.visibleTileArray,
        ...this.Items.array,
      ];

      // tile blocking
      for (let i = 0; i < objectsToCheck.length; i++) {
        const object = objectsToCheck[i];
        if (object.blocking) {
          if (
            x2 > object.x
            && x1 < object.x + object.width
            && y2 > object.y
            && y1 < object.y + object.height
          ) {
            return true;
          }
        }
      }

      // let 'em pass
      return false;
    }

    handleInput(Keyboard) {
      if (this.debug) {
        if (Keyboard.active.tab) {
          const newId = this.heroId + 1;
          this.setHeroCharacter(newId);
          Keyboard.cooldown(200);
        }
      }

      this.hero.handleInput(Keyboard);
    }
  }

  class SceneGame extends Scene {
    init() {
      // create map after scene change
      this.createMap();
    }

    createMap() {
      this.map = new Map(this.game);
    }

    prepareScene() {
      this.pushToScene(this.map);
    }

    clear() {
      // clear the primary layer
      if (this.map.needsUpdate) {
        this.Canvas.clearLayers(['primary', 'secondary', 'override', 'character']);
      }
    }

    /**
     * Handle input for the scene
     *
     * @param {array} activeKeys
     * @returns {void}
     * @memberof SceneMainMenu
     */
    handleInput(Keyboard) {
      // pause the game
      if (Keyboard.active.escape) {
        // cache the current scene in case we're just pausing
        this.game.sceneCache = this.game.scene;
        this.game.setScene('pause');
      }

      this.map.handleInput(Keyboard);
    }

    transitionInCustom() {
      this.Canvas.setContext('primary');

      // do a draw
      this.map.needsUpdate = true;
    }

    // leave the game in the background cause it's pretty sweet looking
    transitionOut() {
      this.Canvas.clearLayers(['character']);
      // do nothing!
    }
  }

  /**
   * The Main Menu scene
   *
   * @class ScenePause
   * @extends {Scene}
   */
  class ScenePause extends Scene {
    /**
     * Constructor
     *
     * @memberof ScenePause
     */
    init() {
      // create the logo object
      this.createLogo();

      // create the menu items
      this.createMenu();

      // keyboard input stuff
      this.allowInput = true;
      this.keyboardCooldown = 150;
      this.keyboardCooldownTimer;
    }

    /**
     * Creates the logo object
     *
     * @memberof ScenePause
     */
    createLogo() {
      const text = 'Paused';
      const font = '44px Arial';
      this.logo = this.Objects.create({
        type: 'text',
        text,
        x: this.Canvas.calcCenteredTextX(text, font),
        y: 64 + this.Canvas.padding,
        font,
      });
    }

    /**
     * Creates the menu
     *
     * @memberof ScenePause
     */
    createMenu() {
      this.menu = this.Objects.create({
        type: 'menu',
        options: [
          {
            text: 'Resume',
            callback: () => {
              this.game.setScene(this.game.sceneCache);
            },
          },
          {
            text: 'Quit To Menu',
            callback: () => {
              this.game.setScene('mainMenu');
            },
          },
        ]
      });
    }

    /**
     * Clear the text layer
     *
     * @memberof SceneMainMenu
     */
    clear() {
      this.Canvas.getLayerByName('menu').clear();
    }

    /**
     * Loads the objects to the scene for drawing
     *
     * @memberof ScenePause
     */
    prepareScene() {
      // draw the background
      this.Canvas.setContext('primary');
      this.Canvas.drawGradientBackground();

      this.Canvas.setContext('menu');

      // push the logo to the scene
      this.pushToScene(this.logo);

      // push the menu to the scene
      this.pushToScene(this.menu);
    }

    /**
     * Handle input for the scene
     *
     * @param {Keyboard} Keyboard
     * @returns {void}
     * @memberof ScenePause
     */
    handleInput(Keyboard) {
      // bail if input is disabled
      if (!this.allowInput) {
        return;
      }

      // handle down
      if (Keyboard.active.down) {
        // increment the focused object
        this.menu.incrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle up
      if (Keyboard.active.up) {
        // decrement the focused object
        this.menu.decrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle enter
      if (Keyboard.active.enter) {
        // do the menu item callback
        this.menu.focusMenuObject.callback();
        this.allowInput = false;
      }

      // go back to game on escape
      if (Keyboard.active.escape) {
        this.game.setScene(this.game.sceneCache);
      }
      
      // set timeout to enable key press again
      window.clearTimeout(this.keyboardCooldownTimer);
      const that = this;
      this.keyboardCooldownTimer = window.setTimeout(function() {
        that.allowInput = true;
      }, this.keyboardCooldown);
    }

    // just clear the primary and background
    transitionOut() {
      const layersToClear = ['menu'];
      for (let i = 0; i < layersToClear.length; i++) {
        this.Canvas.getLayerByName(layersToClear[i]).clear();
      }
    }
  }

  var Scenes = {
    SceneMainMenu,
    SceneGame,
    ScenePause,
  };

  class KeyboardController {
    /**
     * Creates an instance of KeyboardController.
     * @memberof KeyboardController
     */
    constructor() {
      // if disabled, keyboard input will not register
      this.disabled = false;

      // a cooldown timer to prevent all keyboard use
      this.cooldownTimer = null;

      // raw keycodes
      this.keyCodes = {
        9: 'tab',
        13: 'enter',
        16: 'shift',
        27: 'escape',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        49: 'one',
        50: 'two',
        51: 'three',
        52: 'four',
        53: 'five',
        54: 'six',
        55: 'seven',
        56: 'eight',
        57: 'nine',
        58: 'zero',
        65: 'a',
        68: 'd',
        83: 's',
        87: 'w',
        187: 'equals',
        189: 'minus',
      };

      // reference for keys that use shift
      // formatted as keyWihoutShift: keyWithShift
      this.shiftKeys = {
        equals: 'plus',
      };
      
      // human readable key states
      this.active = {
        tab: false,
        enter: false,
        shift: false,
        escape: false,
        up: false,
        right: false,
        down: false,
        left: false,
        w: false,
        a: false,
        s: false,
        d: false,
        equals: false,
        minus: false,
        plus: false,
        zero: false,
        one: false,
        two: false,
        three: false,
        four: false,
        five: false,
        six: false,
        seven: false,
        eight: false,
        nine: false,
      };

      // alias keys
      // if these keys are pressed, they should also mark their aliased key as pressed
      this.aliasKeys = {
        w: 'up',
        a: 'left',
        s: 'down',
        d: 'right',
      };

      // keep track of the active key codes
      // we can intercept the handleInput calls for each scene
      // to prevent unnecessary calculations
      this.activeKeyCodes = [];

      // provide an array of all directions and whether they are active
      // up, right, down, left
      this.directions = [false, false, false, false];

      // provide number array
      this.numbers = [false, false, false, false, false, false, false, false, false, false];
      
      // add event listeners
      this.addEventListeners();
    }

    /**
     * Adds event listeners for keydown, keyup
     *
     * @memberof KeyboardController
     */
    addEventListeners() {
      document.addEventListener('keydown', (e) => {
        this.eventListener(e, true);
      });
      document.addEventListener('keyup', (e) => {
        this.eventListener(e, false);
      });
    }

    /**
     * The event listener for keydown / keyup
     *
     * @param {*} e
     * @returns
     * @memberof KeyboardController
     */
    eventListener(e, press) {
      // bail if disabled
      if (this.disabled) {
        return;
      }

      // bail if we don't care about the ky
      if (typeof this.keyCodes[e.keyCode] === 'undefined') {
        return;
      }

      e.preventDefault();

      // keep track of the active keycodes
      this.updateActiveKeyCodesArray(e.keyCode, press);

      // get the human readable value from keycode
      const key = this.keyCodes[e.keyCode];

      // bail if the state isn't changing
      if (this.active[key] === press) {
        return;
      }

      // otherwise update the state
      this.active[key] = press;
      
      // handle key combos
      this.handleKeyCombos(key, press);

      // update active directions array
      this.updateDirectionsArray();

      // update active numbers array
      this.updateNumberArray();
    }

    /**
     * Adds or removes a keyCode from this.activeKeyCodes
     *
     * @param {*} keyCode
     * @param {*} press
     * @memberof KeyboardController
     */
    updateActiveKeyCodesArray(keyCode, press) {
      // get the index
      const index = this.activeKeyCodes.indexOf(keyCode);

      // if press,
      if (press) {
        // add it if it does not exist
        if (index === -1) {
          this.activeKeyCodes.push(keyCode);
        }
      } else {
        // remove it if it exists
        if (index > -1) {
          this.activeKeyCodes.splice(index, 1);
        }
      }
    }

    /**
     * Updates keys that require shift
     * Updates aliased keys
     *
     * @param {string} key human readable key
     * @param {boolean} active whether the key is being pressed
     * @memberof KeyboardController
     */
    handleKeyCombos(key, active) {    
      // check if there is a shift version we are watching
      const shiftedKeyExists = typeof this.shiftKeys[key] !== 'undefined';

      // if there is a shift version
      if (shiftedKeyExists) {
        // get the shifted key value
        const shiftedKey = this.shiftKeys[key];
        
        // if shift is active, and we're pressing the key
        if (this.active.shift && active) {
          this.active[shiftedKey] = true;
        } else {
          // otherwise set it to inactive
          this.active[shiftedKey] = false;
        }
      }

      // wasd handling
      const aliasKeyExists = typeof this.aliasKeys[key] !== 'undefined';

      // if there is an alias version
      if (aliasKeyExists) {
        // get the alias key value
        const aliasKey = this.aliasKeys[key];

        // TODO: Add handling for the actual key that is being aliased is being pressed
        // TODO: For example, if we're pressing the A key and we're pressing the UP key,
        // TODO: If we release one of those keys, it will say we're not moving up!
        this.active[aliasKey] = active;
      }
    }

    /**
     * Updates the directions array
     *
     * @memberof KeyboardController
     */
    updateDirectionsArray() {
      this.directions = [
        (this.active.up) ? true : false,
        (this.active.right) ? true : false,
        (this.active.down) ? true : false,
        (this.active.left) ? true : false,
      ];
    }

    /**
     * Updates the numbers array
     *
     * @memberof KeyboardController
     */
    updateNumberArray() {
      this.numbers = [
        (this.active.zero) ? true : false,
        (this.active.one) ? true : false,
        (this.active.two) ? true : false,
        (this.active.three) ? true : false,
        (this.active.four) ? true : false,
        (this.active.five) ? true : false,
        (this.active.six) ? true : false,
        (this.active.seven) ? true : false,
        (this.active.eight) ? true : false,
        (this.active.nine) ? true : false,
      ];
    }

    /**
     * Clear all active keys
     *
     * @memberof KeyboardController
     */
    clear() {
      this.activeKeyCodes = [];
      
      this.active = {
        tab: false,
        enter: false,
        shift: false,
        escape: false,
        up: false,
        right: false,
        down: false,
        left: false,
        w: false,
        a: false,
        s: false,
        d: false,
        equals: false,
        minus: false,
        plus: false,
        zero: false,
        one: false,
        two: false,
        three: false,
        four: false,
        five: false,
        six: false,
        seven: false,
        eight: false,
        nine: false,
      };

      // update active directions array
      this.updateDirectionsArray();

      // update active numbers array
      this.updateNumberArray();
    }

    /**
     * Disable use of the keyboard
     *
     * @param {boolean} [disabled=true]
     * @memberof KeyboardController
     */
    setDisabled(disabled = true) {
      this.disabled = disabled;
    }

    /**
     * Disables keyboard use for a period of time
     *
     * @param {number} [timer=100]
     * @memberof KeyboardController
     */
    cooldown(timer = 100) {
      this.setDisabled(true);

      this.clear();

      window.clearTimeout(this.cooldownTimer);
      this.cooldownTimer = window.setTimeout(() => {
        this.setDisabled(false);
      }, timer);
    }
  }

  class Debug {
    /**
     * Creates an instance of Debug.
     * @param {*} Canvas A canvas context to render information on
     * @memberof Debug
     */
    constructor(game) {
      this.game = game;
      this.Canvas = game.Canvas;

      this.canHandleInput = true;
      this.inputThrottleTimer = null;

      this.canToggleLayers = true;
    }

    drawDebugText() {
      // todo
    }

    handleInput() {
      // throttle the input a wee bit
      if (!this.canHandleInput) {
        return;
      }

      // get shorter references to game objects
      const Keyboard = this.game.Keyboard;
      const Canvas = this.game.Canvas;

      // can toggle layers
      if (this.canToggleLayers) {
        for (let i = 0; i < Keyboard.numbers.length; i++) {
          if (
            Keyboard.numbers[i]
            && typeof Canvas.layers[i] !== 'undefined'
          ) {
            Canvas.layers[i].toggleVisible();
            this.doInputCooldown();
          }
        }
      }
    }

    /**
     * Sets timeout to re-enable input handling
     *
     * @memberof Debug
     */
    doInputCooldown() {
      this.canHandleInput = false;

      window.clearTimeout(this.inputThrottleTimer);
      this.inputThrottleTimer = window.setTimeout(() => {
        this.canHandleInput = true;
      }, 150);
    }
  }

  function game() {
    // debug stuff
    this.timestamp = 0;
    this.fps = 0;

    // debug handler
    this.Debug = new Debug(this);
    this.debug = true;

    // input handler
    this.Keyboard = new KeyboardController();

    // create the canvas
    this.Canvas = new Canvas({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // the object factory
    this.Objects = new Objects(this);

    // define the scenes
    this.scenes = {
      mainMenu: Scenes.SceneMainMenu,
      game: Scenes.SceneGame,
      pause: Scenes.ScenePause,
    };

    /** 
     * A method for setting the current scene
     */
    this.setScene = (scene) => {
      // transition out of the current scene
      if (typeof this.scene !== 'undefined') {
        this.scene.transitionOut();
      }

      // if scene is an existing scene object, use it
      // otherwise create a new scene of the specified type
      this.scene = typeof scene === 'object'
        ? scene
        : new this.scenes[scene](this);
      
      // transition into new scene
      this.scene.transitionIn();
    };

    /**
     * Calls request animation frame and the update function
     */
    this.loop = (timestamp) => {
      window.requestAnimationFrame( this.loop );
      this.update(timestamp);
    };

    /**
     * Gets called once per frame
     * This is where the logic goes
     */
    this.update = (timestamp) => {
      // clear the previous frame
      this.scene.clear();

      if (this.debug) {
        this.Canvas.debugLayer.clear();
      }

      // draw the current frame
      this.scene.draw();

      // handle keyboard input
      if (this.Keyboard.activeKeyCodes.length > 0) {
        this.scene.handleInput(this.Keyboard);

        if (this.debug) {
          this.Debug.handleInput();
        }
      }

      // maybe show debug info
      if (this.debug) {
        // fps
        const delta = (timestamp - this.timestamp) / 1000;
        this.timestamp = timestamp;
        this.Canvas.pushDebugText('fps', `FPS: ${1 / delta}`);

        // active keys
        this.Canvas.pushDebugText('activeKeys', `Keyboard.activeKeyCodes: [${this.Keyboard.activeKeyCodes.toString()}]`);

        // TODO: This is an expensive operation, 
        // TODO: Should be generated by a keystroke, not calculated every frame
        // if (this.Keyboard.active.shift) {
        //   this.Canvas.pushDebugText('maparray', `MapArray bytes: ${objectSizeof(this.scene.map.mapArray)}`);
        // }

        // draw debug text
        this.Canvas.drawDebugText();
      }
    };

    
    this.init = () => {
      // set the current scene to the main menu
      this.setScene('mainMenu');

      // start the game loop
      this.loop();
    };

    // kick the tires and light the fires!!!
    this.init();
  }

  return game;

}());
