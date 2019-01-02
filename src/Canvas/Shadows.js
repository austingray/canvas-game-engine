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
    this.light.shadow.camera.far = this.width      // default
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

export default Shadows;
