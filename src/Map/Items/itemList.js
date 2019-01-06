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
      this.mesh.position.z = -1;

      const ctx = Canvas.overrideLayer.context
      ctx.fillStyle = '#888787';
      ctx.fillRect(x, y, this.width, this.height);
      // Canvas.roundRect(ctx, x, y, this.width, this.height, 20, '#888787', 0);
    },
    createMesh() {
      const material = new THREE.MeshBasicMaterial({
        color: 0x333333,
        opacity: 0,
        transparent: true,
      });
      const depth = 50;
      const geometry = new THREE.BoxGeometry( this.width, this.height, depth );
      this.mesh = new THREE.Mesh( geometry, material );
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = false;
    },
  },
  {
    name: 'torch',
    blocking: false,
    shadow: false,
    light: true,
    width: 16,
    height: 16,
    spawnRate: .02,
    snapToGrid: false,
    draw(Canvas) {
      const x = this.x + Canvas.Camera.offsetX + 5;
      const y = this.y + Canvas.Camera.offsetY + 5;
      const radius = 8;
      const startAngle = Math.PI / 180 * 0;
      const endAngle = Math.PI / 180 * 360;
      const anticlockwise = false;

      // this.mesh.position.x = x - Canvas.Camera.width / 2;
      // this.mesh.position.y = y - Canvas.Camera.height / 2;
      // this.mesh.position.z = 0;
      
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
    createMesh() {
      // this.mesh = new THREE.PointLight( 0xFFFFFF, 5, 100, 2 );
      // this.mesh.castShadow = true;
      // this.mesh.position.set( 0, 0, -25 );

      // //Set up shadow properties for the light    
      // this.mesh.shadow.mapSize.width = 512;  // default
      // this.mesh.shadow.mapSize.height = 512; // default
      // this.mesh.shadow.camera.near = 0.5;       // default
    }
  },
];

export default itemList;
