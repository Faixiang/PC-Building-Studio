import * as THREE from 'three';
import { makeGhost, worldTransform } from '../parts/loader.js';
import { toast } from '../ui/panel.js';

export class DragInstaller {
  constructor({ scene, camera, renderer, controls, onInstall, onError }) {
    Object.assign(this, { scene, camera, renderer, controls, onInstall, onError });
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.enabled = false; this.animating = false; this.part = null; this.anchor = null; this.ghost = null;
    this.drawerFollower = null;
    this.animations = new Set();
    this.onDown = e => this.pointerDown(e);
    this.boundMove = e => this.pointerMove(e);
    this.boundUp = e => this.pointerUp(e);
    window.addEventListener('pointerdown', this.onDown, { capture: true });
    window.addEventListener('blur', () => { if (this.dragging) this.cancelDrag(); });
  }

  getDragPlane() {
    const normal = this.camera.getWorldDirection(new THREE.Vector3());
    return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, this.anchor.getWorldPosition(new THREE.Vector3()));
  }

  setTask(part, anchor, errorMessage) {
    this.clearGhost(); this.clearDrawerFollower();
    this.part = part; this.anchor = anchor; this.errorMessage = errorMessage;
    this.origin = { position: part.position.clone(), quaternion: part.quaternion.clone() };
    this.enabled = false;
    if (part && anchor) {
      this.ghost = makeGhost(part); this.scene.add(this.ghost);
      const target = worldTransform(anchor); this.ghost.position.copy(target.position); this.ghost.quaternion.copy(target.quaternion);
    }
  }

  startFromDrawer(event, templatePart) {
    if (!this.anchor || this.animating) return;
    this.clearDrawerFollower();
    this.drawerFollower = makeGhost(templatePart);
    this.drawerFollower.traverse(n => { if (n.isMesh) n.material.opacity = 0.55; });
    this.scene.add(this.drawerFollower);
    this.updatePointer(event);
    this.plane = this.getDragPlane();
    const hit = this.raycaster.ray.intersectPlane(this.plane, new THREE.Vector3());
    if (hit) this.drawerFollower.position.copy(hit);
    this.dragging = true; this.controls.enabled = false;
    window.addEventListener('pointermove', this.boundMove, { capture: true });
    window.addEventListener('pointerup', this.boundUp, { capture: true });
    window.addEventListener('pointercancel', this.boundUp, { capture: true });
  }

  clear() { this.enabled = false; this.clearGhost(); this.clearDrawerFollower(); this.part = null; this.anchor = null; }
  clearGhost() { if (this.ghost) { this.scene.remove(this.ghost); this.ghost = null; } }
  clearDrawerFollower() { if (this.drawerFollower) { this.scene.remove(this.drawerFollower); this.drawerFollower = null; } }

  updatePointer(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  pointerDown(e) {
    if (!this.enabled || this.animating || e.button !== 0 || !this.part) return;
    this.updatePointer(e);
    if (!this.raycaster.intersectObject(this.part, true).length) return;
    e.stopPropagation(); this.dragging = true; this.controls.enabled = false;
    window.addEventListener('pointermove', this.boundMove, { capture: true });
    window.addEventListener('pointerup', this.boundUp, { capture: true });
    window.addEventListener('pointercancel', this.boundUp, { capture: true });
    this.plane = this.getDragPlane();
    this.renderer.domElement.style.cursor = 'grabbing';
  }

  pointerMove(e) {
    this.updatePointer(e);
    if (!this.dragging) {
      const hover = this.enabled && this.part && this.raycaster.intersectObject(this.part, true).length;
      this.renderer.domElement.style.cursor = hover ? 'grab' : 'default'; return;
    }
    const hit = this.raycaster.ray.intersectPlane(this.plane, new THREE.Vector3());
    if (!hit) return;
    if (this.drawerFollower) {
      this.drawerFollower.position.copy(hit);
      const distance = hit.distanceTo(this.anchor.getWorldPosition(new THREE.Vector3()));
      this.drawerFollower.traverse(n => { if (n.isMesh) n.material.opacity = distance < 1.4 ? 0.7 : 0.4; });
    } else if (this.part) {
      this.part.position.copy(hit);
      const distance = hit.distanceTo(this.anchor.getWorldPosition(new THREE.Vector3()));
      if (this.ghost) { this.ghost.visible = distance < 3.2; this.ghost.traverse(n => { if (n.isMesh) n.material.opacity = distance < 1.4 ? 0.45 : 0.18; }); }
    }
  }

  pointerUp(e) {
    if (!this.dragging) return;
    this.dragging = false; this.controls.enabled = true; this.renderer.domElement.style.cursor = 'default';
    window.removeEventListener('pointermove', this.boundMove, { capture: true });
    window.removeEventListener('pointerup', this.boundUp, { capture: true });
    window.removeEventListener('pointercancel', this.boundUp, { capture: true });
    if (this.drawerFollower) {
      const distance = this.drawerFollower.position.distanceTo(this.anchor.getWorldPosition(new THREE.Vector3()));
      this.clearDrawerFollower();
      if (distance < 1.45) {
        this.part.position.copy(this.anchor.getWorldPosition(new THREE.Vector3()));
        this.part.quaternion.copy(this.anchor.getWorldQuaternion(new THREE.Quaternion()));
        const part = this.part; this.enabled = false;
        this.animateTo(part, this.anchor, () => {
          this.anchor.parent.attach(part); part.position.copy(this.anchor.position); part.quaternion.copy(this.anchor.quaternion);
          this.clearGhost(); this.onInstall(part);
        });
      } else {
        this.onError(this.errorMessage);
      }
    } else if (this.part) {
      const distance = this.part.position.distanceTo(this.anchor.getWorldPosition(new THREE.Vector3()));
      if (distance < 1.45) {
        const part = this.part; this.enabled = false;
        this.animateTo(part, this.anchor, () => {
          this.anchor.parent.attach(part); part.position.copy(this.anchor.position); part.quaternion.copy(this.anchor.quaternion);
          this.clearGhost(); this.onInstall(part);
        });
      } else {
        this.animate(this.part, this.origin.position, this.origin.quaternion, 420);
        this.onError(this.errorMessage);
      }
    }
  }

  cancelDrag() {
    if (!this.dragging) return;
    this.dragging = false; this.controls.enabled = true;
    window.removeEventListener('pointermove', this.boundMove, { capture: true });
    window.removeEventListener('pointerup', this.boundUp, { capture: true });
    window.removeEventListener('pointercancel', this.boundUp, { capture: true });
    if (this.drawerFollower) { this.clearDrawerFollower(); this.onError?.(this.errorMessage); }
    else if (this.part) { this.animate(this.part, this.origin.position, this.origin.quaternion, 300); }
  }

  animateTo(object, anchor, onDone, duration = 650) {
    const t = worldTransform(anchor); this.animate(object, t.position, t.quaternion, duration, onDone);
  }
  animate(object, toPosition, toQuaternion, duration = 650, onDone) {
    this.animating = true;
    this.animations.add({ object, fromPosition: object.position.clone(), fromQuaternion: object.quaternion.clone(), toPosition: toPosition.clone(), toQuaternion: toQuaternion.clone(), start: performance.now(), duration, onDone });
  }

  demo() {
    if (this.animating || !this.part || !this.anchor) return;
    const follower = makeGhost(this.part);
    follower.traverse(n => { if (n.isMesh) n.material.opacity = 0.6; });
    this.scene.add(follower);
    const startPos = this.camera.position.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3));
    follower.position.copy(startPos);
    this.animateTo(follower, this.anchor, () => {
      setTimeout(() => {
        this.animate(follower, startPos, follower.quaternion, 600, () => { this.scene.remove(follower); toast('看清楚位置與方向了嗎？現在換你試試看！', 'success'); });
      }, 700);
    });
  }

  update() {
    for (const a of this.animations) {
      const t = Math.min((performance.now() - a.start) / a.duration, 1); const ease = 1 - Math.pow(1 - t, 3);
      a.object.position.lerpVectors(a.fromPosition, a.toPosition, ease);
      a.object.quaternion.slerpQuaternions(a.fromQuaternion, a.toQuaternion, ease);
      if (t === 1) { this.animations.delete(a); this.animating = this.animations.size > 0; a.onDone?.(); }
    }
    if (this.enabled && this.ghost && !this.dragging) {
      this.ghost.visible = true;
      this.ghost.traverse(n => { if (n.isMesh) n.material.opacity = 0.12 + Math.sin(performance.now() / 400) * 0.05; });
    }
  }
}
