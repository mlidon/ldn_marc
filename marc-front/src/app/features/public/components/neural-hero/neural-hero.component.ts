import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as THREE from 'three';

interface HeroPalette {
  point: string;
  line: string;
  lineOpacity: number;
  glowPrimary: string;
  glowSecondary: string;
}

@Component({
  selector: 'app-neural-hero',
  imports: [RouterLink],
  templateUrl: './neural-hero.component.html',
  styleUrl: './neural-hero.component.scss',
})
export class NeuralHeroComponent implements AfterViewInit, OnDestroy {
  private readonly heroHost = viewChild.required<ElementRef<HTMLElement>>('heroHost');
  private readonly canvasHost = viewChild.required<ElementRef<HTMLDivElement>>('canvasHost');

  protected webglSupported = true;
  protected isDarkTheme = false;

  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;

  private neuralGroup: THREE.Group | null = null;
  private orbitalGroup: THREE.Group | null = null;

  private pointsGeometry: THREE.BufferGeometry | null = null;
  private pointsMaterial: THREE.PointsMaterial | null = null;
  private pointsMesh: THREE.Points | null = null;

  private lineGeometry: THREE.BufferGeometry | null = null;
  private lineMaterial: THREE.LineBasicMaterial | null = null;

  private glowGeometry: THREE.SphereGeometry | null = null;
  private glowNodes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = [];

  private animationFrameId: number | null = null;
  private themeObserver: MutationObserver | null = null;

  private reducedMotion = false;
  private particleCount = 92;
  private lineThreshold = 4.8;
  private bounds = 12;

  private positions: Float32Array = new Float32Array(0);
  private velocities: Float32Array = new Float32Array(0);
  private linePositions: Float32Array = new Float32Array(0);
  private lineColors: Float32Array = new Float32Array(0);

  private elapsed = 0;
  private pulsePhase = Math.random() * Math.PI * 2;

  private pointerTarget = new THREE.Vector2(0, 0);
  private pointerCurrent = new THREE.Vector2(0, 0);

  private readonly onResize = () => this.handleResize();
  private readonly onPointerMove = (event: MouseEvent) => this.handlePointerMove(event);
  private readonly onPointerLeave = () => {
    this.pointerTarget.set(0, 0);
  };

  ngAfterViewInit(): void {
    this.reducedMotion = this.prefersReducedMotion();
    this.handleThemeMutation();
    this.observeThemeChanges();

    this.webglSupported = this.isWebglAvailable();
    if (!this.webglSupported) {
      return;
    }

    this.initializeScene();
    this.applyThemePalette();
    this.handleResize();

    const host = this.heroHost().nativeElement;
    host.addEventListener('mousemove', this.onPointerMove);
    host.addEventListener('mouseleave', this.onPointerLeave);
    window.addEventListener('resize', this.onResize);

    if (this.reducedMotion) {
      this.renderOnce();
      return;
    }

    this.startAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.themeObserver?.disconnect();
    this.themeObserver = null;

    window.removeEventListener('resize', this.onResize);

    const hostRef = this.heroHost();
    const host = hostRef?.nativeElement;

    if (host) {
      host.removeEventListener('mousemove', this.onPointerMove);
      host.removeEventListener('mouseleave', this.onPointerLeave);
    }

    this.pointsGeometry?.dispose();
    this.pointsMaterial?.dispose();
    this.lineGeometry?.dispose();
    this.lineMaterial?.dispose();
    this.glowGeometry?.dispose();

    for (const node of this.glowNodes) {
      node.material.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement.remove();
    }

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.neuralGroup = null;
    this.orbitalGroup = null;

    this.pointsGeometry = null;
    this.pointsMaterial = null;
    this.pointsMesh = null;
    this.lineGeometry = null;
    this.lineMaterial = null;

    this.glowGeometry = null;
    this.glowNodes = [];
  }

  private initializeScene(): void {
    const canvasContainer = this.canvasHost().nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0b1527, 16, 38);

    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    this.camera.position.set(0, 0, 27);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    canvasContainer.appendChild(this.renderer.domElement);

    this.neuralGroup = new THREE.Group();
    this.orbitalGroup = new THREE.Group();

    this.scene.add(this.neuralGroup);
    this.scene.add(this.orbitalGroup);

    const isMobile = window.matchMedia('(max-width: 860px)').matches;
    this.particleCount = isMobile ? 45 : 96;
    this.lineThreshold = isMobile ? 4.3 : 4.95;
    this.bounds = isMobile ? 10 : 12;

    this.createParticles();
    this.createConnections();
    this.createGlowNodes();

    const softLight = new THREE.PointLight(0x77d4ff, 1.25, 120);
    softLight.position.set(-8, 7, 18);
    this.scene.add(softLight);

    const accentLight = new THREE.PointLight(0x31c59a, 1.0, 120);
    accentLight.position.set(9, -5, 14);
    this.scene.add(accentLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.19);
    this.scene.add(ambientLight);
  }

  private createParticles(): void {
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i += 1) {
      const offset = i * 3;
      this.positions[offset] = this.randomRange(-this.bounds, this.bounds);
      this.positions[offset + 1] = this.randomRange(-this.bounds * 0.72, this.bounds * 0.72);
      this.positions[offset + 2] = this.randomRange(-this.bounds * 0.48, this.bounds * 0.48);

      this.velocities[offset] = this.randomRange(-0.014, 0.014);
      this.velocities[offset + 1] = this.randomRange(-0.012, 0.012);
      this.velocities[offset + 2] = this.randomRange(-0.009, 0.009);
    }

    this.pointsGeometry = new THREE.BufferGeometry();
    this.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.pointsMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#9de8ff'),
      size: 0.14,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.pointsMesh = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    this.neuralGroup?.add(this.pointsMesh);
  }

  private createConnections(): void {
    const maxConnections = this.particleCount * 13;
    this.linePositions = new Float32Array(maxConnections * 6);
    this.lineColors = new Float32Array(maxConnections * 6);

    this.lineGeometry = new THREE.BufferGeometry();
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
    this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));
    this.lineGeometry.setDrawRange(0, 0);

    this.lineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.23,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    const lineSegments = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
    this.neuralGroup?.add(lineSegments);

    this.updateConnections();
  }

  private createGlowNodes(): void {
    if (!this.orbitalGroup) {
      return;
    }

    this.glowGeometry = new THREE.SphereGeometry(0.28, 16, 16);

    for (let i = 0; i < 4; i += 1) {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(i % 2 === 0 ? '#6fd7ff' : '#5ce8c2'),
        transparent: true,
        opacity: 0.45,
      });

      const glow = new THREE.Mesh(this.glowGeometry, material);
      glow.position.set(
        this.randomRange(-4.6, 4.6),
        this.randomRange(-2.6, 2.6),
        this.randomRange(-1.8, 1.8),
      );

      this.glowNodes.push(glow);
      this.orbitalGroup.add(glow);
    }
  }

  private startAnimation(): void {
    const tick = () => {
      this.animationFrameId = requestAnimationFrame(tick);
      this.elapsed += 0.016;

      this.updateParticles();
      this.updateConnections();
      this.updatePulse();
      this.updateRotation();
      this.updateGlowNodes();

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    tick();
  }

  private renderOnce(): void {
    this.updateConnections();
    this.updatePulse();
    this.updateRotation();
    this.updateGlowNodes();

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updateParticles(): void {
    const marginX = this.bounds;
    const marginY = this.bounds * 0.72;
    const marginZ = this.bounds * 0.48;

    const pointerX = this.pointerCurrent.x * this.bounds * 0.62;
    const pointerY = -this.pointerCurrent.y * this.bounds * 0.5;
    const influenceRadius = this.bounds * 0.58;
    const influenceRadiusSquared = influenceRadius * influenceRadius;
    const innerRadiusSquared = (influenceRadius * 0.28) * (influenceRadius * 0.28);

    for (let i = 0; i < this.particleCount; i += 1) {
      const offset = i * 3;

      let vx = this.velocities[offset];
      let vy = this.velocities[offset + 1];
      let vz = this.velocities[offset + 2];

      const dx = pointerX - this.positions[offset];
      const dy = pointerY - this.positions[offset + 1];
      const distSquared = dx * dx + dy * dy;

      if (distSquared > 0.0001 && distSquared < influenceRadiusSquared && !this.reducedMotion) {
        const dist = Math.sqrt(distSquared);
        const nx = dx / dist;
        const ny = dy / dist;
        const falloff = 1 - distSquared / influenceRadiusSquared;
        const force = falloff * 0.0017;

        if (distSquared < innerRadiusSquared) {
          vx -= nx * force * 2.2;
          vy -= ny * force * 2.2;
        } else {
          vx += nx * force * 0.75;
          vy += ny * force * 0.75;
        }
      }

      vx *= 0.996;
      vy *= 0.996;
      vz *= 0.997;

      this.positions[offset] += vx;
      this.positions[offset + 1] += vy;
      this.positions[offset + 2] += vz;

      if (Math.abs(this.positions[offset]) > marginX) {
        vx *= -1;
      }

      if (Math.abs(this.positions[offset + 1]) > marginY) {
        vy *= -1;
      }

      if (Math.abs(this.positions[offset + 2]) > marginZ) {
        vz *= -1;
      }

      this.velocities[offset] = vx;
      this.velocities[offset + 1] = vy;
      this.velocities[offset + 2] = vz;
    }

    const positionAttr = this.pointsGeometry?.getAttribute('position') as THREE.BufferAttribute;
    if (positionAttr) {
      positionAttr.needsUpdate = true;
    }
  }

  private updateConnections(): void {
    if (!this.lineMaterial) {
      return;
    }

    let lineIndex = 0;
    const thresholdSquared = this.lineThreshold * this.lineThreshold;
    const lineColor = this.lineMaterial.color;

    for (let i = 0; i < this.particleCount; i += 1) {
      const iOffset = i * 3;
      const ix = this.positions[iOffset];
      const iy = this.positions[iOffset + 1];
      const iz = this.positions[iOffset + 2];

      for (let j = i + 1; j < this.particleCount; j += 1) {
        const jOffset = j * 3;
        const dx = ix - this.positions[jOffset];
        const dy = iy - this.positions[jOffset + 1];
        const dz = iz - this.positions[jOffset + 2];
        const distanceSquared = dx * dx + dy * dy + dz * dz;

        if (distanceSquared > thresholdSquared) {
          continue;
        }

        if (lineIndex + 6 > this.linePositions.length) {
          break;
        }

        const strength = Math.max(0.2, 1 - distanceSquared / thresholdSquared);
        const cr = lineColor.r * strength;
        const cg = lineColor.g * strength;
        const cb = lineColor.b * strength;

        this.linePositions[lineIndex] = ix;
        this.lineColors[lineIndex++] = cr;
        this.linePositions[lineIndex] = iy;
        this.lineColors[lineIndex++] = cg;
        this.linePositions[lineIndex] = iz;
        this.lineColors[lineIndex++] = cb;

        this.linePositions[lineIndex] = this.positions[jOffset];
        this.lineColors[lineIndex++] = cr;
        this.linePositions[lineIndex] = this.positions[jOffset + 1];
        this.lineColors[lineIndex++] = cg;
        this.linePositions[lineIndex] = this.positions[jOffset + 2];
        this.lineColors[lineIndex++] = cb;
      }
    }

    if (this.lineGeometry) {
      this.lineGeometry.setDrawRange(0, Math.floor(lineIndex / 3));
      const positionAttr = this.lineGeometry.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = this.lineGeometry.getAttribute('color') as THREE.BufferAttribute;
      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }
  }

  private updatePulse(): void {
    if (!this.pointsMaterial) {
      return;
    }

    const baseSize = this.isDarkTheme ? 0.14 : 0.12;
    const amplitude = this.reducedMotion ? 0.01 : 0.032;
    const pulse = Math.sin(this.elapsed * 1.3 + this.pulsePhase) * amplitude;

    this.pointsMaterial.size = baseSize + pulse;
    this.pointsMaterial.opacity = this.isDarkTheme ? 0.85 : 0.66;
  }

  private updateRotation(): void {
    this.pointerCurrent.x += (this.pointerTarget.x - this.pointerCurrent.x) * 0.075;
    this.pointerCurrent.y += (this.pointerTarget.y - this.pointerCurrent.y) * 0.075;

    if (!this.neuralGroup || !this.orbitalGroup || !this.camera) {
      return;
    }

    this.neuralGroup.rotation.y = this.pointerCurrent.x * 0.27 + this.elapsed * 0.03;
    this.neuralGroup.rotation.x = this.pointerCurrent.y * 0.14;

    this.orbitalGroup.rotation.z += this.reducedMotion ? 0.0003 : 0.0012;
    this.orbitalGroup.rotation.y += this.reducedMotion ? 0.0002 : 0.0009;

    this.camera.position.x = this.pointerCurrent.x * 2.15;
    this.camera.position.y = -this.pointerCurrent.y * 1.35;
    this.camera.lookAt(0, 0, 0);
  }

  private updateGlowNodes(): void {
    if (!this.glowNodes.length) {
      return;
    }

    for (let i = 0; i < this.glowNodes.length; i += 1) {
      const node = this.glowNodes[i];
      const motion = this.elapsed * (0.55 + i * 0.1);
      node.position.y += Math.sin(motion) * 0.003;
      node.position.x += Math.cos(motion * 0.8) * 0.0025;

      const pulse = 0.8 + Math.sin(this.elapsed * 2.1 + i) * 0.22;
      node.scale.setScalar(pulse);
      node.material.opacity = this.isDarkTheme ? 0.42 : 0.34;
    }
  }

  private handleResize(): void {
    if (!this.renderer || !this.camera) {
      return;
    }

    const host = this.heroHost().nativeElement;
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);

    if (this.reducedMotion) {
      this.renderOnce();
    }
  }

  private handlePointerMove(event: MouseEvent): void {
    if (this.reducedMotion) {
      return;
    }

    const rect = this.heroHost().nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    this.pointerTarget.set((x - 0.5) * 2, (y - 0.5) * 2);
  }

  private observeThemeChanges(): void {
    this.themeObserver = new MutationObserver(() => this.handleThemeMutation());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    if (document.body) {
      this.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }

  private handleThemeMutation(): void {
    const rootDark = document.documentElement.classList.contains('theme-dark');
    const bodyDark = document.body?.classList.contains('theme-dark') ?? false;
    this.isDarkTheme = rootDark || bodyDark;

    this.applyThemePalette();

    if (this.reducedMotion && this.webglSupported) {
      this.renderOnce();
    }
  }

  private applyThemePalette(): void {
    const palette = this.getPalette();

    if (this.pointsMaterial) {
      this.pointsMaterial.color.set(palette.point);
      this.pointsMaterial.opacity = this.isDarkTheme ? 0.85 : 0.66;
      this.pointsMaterial.needsUpdate = true;
    }

    if (this.lineMaterial) {
      this.lineMaterial.color.set(palette.line);
      this.lineMaterial.opacity = palette.lineOpacity;
      this.lineMaterial.needsUpdate = true;
    }

    if (this.scene?.fog) {
      this.scene.fog.color.set(this.isDarkTheme ? '#0b1527' : '#dcecf5');
    }

    if (this.glowNodes.length > 0) {
      for (let i = 0; i < this.glowNodes.length; i += 1) {
        const material = this.glowNodes[i].material;
        material.color.set(i % 2 === 0 ? palette.glowPrimary : palette.glowSecondary);
        material.opacity = this.isDarkTheme ? 0.42 : 0.34;
        material.needsUpdate = true;
      }
    }
  }

  private getPalette(): HeroPalette {
    if (this.isDarkTheme) {
      return {
        point: '#8ee7ff',
        line: '#4ea9ff',
        lineOpacity: 0.24,
        glowPrimary: '#6cdcff',
        glowSecondary: '#56e3bf',
      };
    }

    return {
      point: '#1f90b8',
      line: '#168aa5',
      lineOpacity: 0.34,
      glowPrimary: '#41b9d9',
      glowSecondary: '#3fc7a2',
    };
  }

  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private isWebglAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const canvas = document.createElement('canvas');
      const context =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');

      return !!context;
    } catch {
      return false;
    }
  }

  private randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
