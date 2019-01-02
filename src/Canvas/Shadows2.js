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
    this.light.shadow.camera.far = this.width      // default
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

export default Shadows2;
