import { BackSide, DoubleSide, FrontSide, ShaderMaterial } from "three";

let _workaroundActive = false;

export class OverrideMaterialManager {

	static get workaroundEnabled() {
		return _workaroundActive;
	}

	static set workaroundEnabled(value) {
		_workaroundActive = value;
	}

	constructor(material = null) {
		this.originalMaterials = new Map();
		this.material = null;
		this.materials = null;
		this.materialsBackSide = null;
		this.materialsDoubleSide = null;
		this.materialsFlatShaded = null;
		this.materialsFlatShadedBackSide = null;
		this.materialsFlatShadedDoubleSide = null;
		this.meshCount = 0;

		this._replaceMaterial = (node) => {
			if (node.isMesh) {
				let pool;
				if (node.material.flatShading) {
					switch (node.material.side) {
						case DoubleSide: pool = this.materialsFlatShadedDoubleSide; break;
						case BackSide: pool = this.materialsFlatShadedBackSide; break;
						default: pool = this.materialsFlatShaded; break;
					}
				} else {
					switch (node.material.side) {
						case DoubleSide: pool = this.materialsDoubleSide; break;
						case BackSide: pool = this.materialsBackSide; break;
						default: pool = this.materials; break;
					}
				}
				this.originalMaterials.set(node, node.material);
				if (node.isSkinnedMesh) {
					node.material = pool[2];
				} else if (node.isInstancedMesh) {
					node.material = pool[1];
				} else {
					node.material = pool[0];
				}
				this.meshCount++;
			}
		};

		this.setMaterial(material);
	}

	_cloneMaterial(mat) {
		if (!(mat instanceof ShaderMaterial)) {
			return mat.clone();
		}

		const uniforms = mat.uniforms;
		const saved = new Map();
		for (const key in uniforms) {
			const val = uniforms[key].value;
			if (val && val.isRenderTargetTexture) {
				uniforms[key].value = null;
				saved.set(key, val);
			}
		}

		const clone = mat.clone();
		for (const [key, val] of saved) {
			uniforms[key].value = val;
			clone.uniforms[key].value = val;
		}
		return clone;
	}

	setMaterial(material) {
		this._disposeMaterials();
		this.material = material;

		if (material !== null) {
			const base = [
				this._cloneMaterial(material),
				this._cloneMaterial(material),
				this._cloneMaterial(material)
			];
			for (const m of base) {
				m.uniforms = Object.assign({}, material.uniforms);
				m.side = FrontSide;
			}
			base[2].skinning = true;
			this.materials = base;

			this.materialsBackSide = base.map(m => {
				const c = this._cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.side = BackSide;
				return c;
			});

			this.materialsDoubleSide = base.map(m => {
				const c = this._cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.side = DoubleSide;
				return c;
			});

			this.materialsFlatShaded = base.map(m => {
				const c = this._cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.flatShading = true;
				return c;
			});

			this.materialsFlatShadedBackSide = base.map(m => {
				const c = this._cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.flatShading = true;
				c.side = BackSide;
				return c;
			});

			this.materialsFlatShadedDoubleSide = base.map(m => {
				const c = this._cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.flatShading = true;
				c.side = DoubleSide;
				return c;
			});
		}
	}

	render(renderer, scene, camera) {
		const shadowMapEnabled = renderer.shadowMap.enabled;
		renderer.shadowMap.enabled = false;

		if (_workaroundActive) {
			this.meshCount = 0;
			scene.traverse(this._replaceMaterial);
			renderer.render(scene, camera);
			for (const [obj, mat] of this.originalMaterials) {
				obj.material = mat;
			}
			if (this.meshCount !== this.originalMaterials.size) {
				this.originalMaterials.clear();
			}
		} else {
			const prev = scene.overrideMaterial;
			scene.overrideMaterial = this.material;
			renderer.render(scene, camera);
			scene.overrideMaterial = prev;
		}

		renderer.shadowMap.enabled = shadowMapEnabled;
	}

	_disposeMaterials() {
		if (this.material !== null && this.materials !== null) {
			const all = [
				...this.materials,
				...this.materialsBackSide,
				...this.materialsDoubleSide,
				...this.materialsFlatShaded,
				...this.materialsFlatShadedBackSide,
				...this.materialsFlatShadedDoubleSide
			];
			for (const m of all) {
				m.dispose();
			}
		}
	}

	dispose() {
		this.originalMaterials.clear();
		this._disposeMaterials();
	}

}
