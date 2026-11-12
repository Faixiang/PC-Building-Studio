import * as THREE from 'three';

export class CameraDirector {
  constructor(camera, controls) {
    this.camera = camera; this.controls = controls; this.tween = null;
  }
  focus(target, offset = new THREE.Vector3(5, 4, 7)) {
    this.tween = {
      start: performance.now(), duration: 850,
      fromPosition: this.camera.position.clone(), toPosition: target.clone().add(offset),
      fromTarget: this.controls.target.clone(), toTarget: target.clone(),
    };
  }
  overview() { this.focus(new THREE.Vector3(2.2, 2.5, 0), new THREE.Vector3(10, 7, 13)); }
  update() {
    if (!this.tween) return;
    const t = Math.min((performance.now() - this.tween.start) / this.tween.duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    this.camera.position.lerpVectors(this.tween.fromPosition, this.tween.toPosition, ease);
    this.controls.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, ease);
    if (t === 1) this.tween = null;
  }
}
