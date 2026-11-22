import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const DRACO_DECODER_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

/**
 * Checks if an optional .glb file actually exists at the given relative URL
 * and contains valid binary glTF magic bytes ("glTF" = 0x67 0x6C 0x54 0x46).
 * This avoids both Vite SPA HTML fallback parse errors and console noise when
 * local GLB models are not yet placed in public/models/.
 */
export async function tryLoadOptionalGlb(
  url: string,
  targetHeight: number,
  signal?: AbortSignal,
): Promise<THREE.Group | null> {
  try {
    const response = await fetch(url, { signal, cache: 'no-cache' });
    if (!response.ok) return null;

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html')) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 12) return null;

    // Verify binary GLB magic header: 'g', 'l', 'T', 'F'
    const header = new Uint8Array(buffer, 0, 4);
    const isBinaryGlb =
      header[0] === 0x67 &&
      header[1] === 0x6c &&
      header[2] === 0x54 &&
      header[3] === 0x46;

    if (!isBinaryGlb) {
      return null;
    }

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_DECODER_URL);

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      gltfLoader.parse(
        buffer,
        '',
        (parsed) => resolve(parsed),
        (err) => reject(err),
      );
    });

    dracoLoader.dispose();

    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxHeight = size.y > 0.0001 ? size.y : Math.max(size.x, size.y, size.z, 1);
    const scale = targetHeight / maxHeight;

    const wrapper = new THREE.Group();
    model.position.sub(center);
    model.scale.setScalar(scale);

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    wrapper.add(model);
    return wrapper;
  } catch {
    // Gracefully fall back to procedural 3D anatomy without console errors
    return null;
  }
}

export function disposeObject3D(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      geometries.add(mesh.geometry);
    }
    if (mesh.material) {
      const matList = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      matList.forEach((mat) => {
        materials.add(mat);
        const stdMat = mat as THREE.MeshStandardMaterial;
        if (stdMat.map) textures.add(stdMat.map);
        if (stdMat.normalMap) textures.add(stdMat.normalMap);
        if (stdMat.roughnessMap) textures.add(stdMat.roughnessMap);
        if (stdMat.bumpMap) textures.add(stdMat.bumpMap);
      });
    }
  });

  geometries.forEach((g) => g.dispose());
  textures.forEach((t) => t.dispose());
  materials.forEach((m) => m.dispose());
}
