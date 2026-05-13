import { Color, Uniform, UnsignedByteType, WebGLRenderTarget } from "three";
import { Selection } from "../core/Selection.js";
import { BlendFunction, KernelSize } from "../enums/index.js";
import { DepthComparisonMaterial } from "../materials/DepthComparisonMaterial.js";
import { OutlineEdgeMaterial } from "../materials/OutlineEdgeMaterial.js";
import { BufferClearPass } from "../passes/BufferClearPass.js";
import { DepthPass } from "../passes/DepthPass.js";
import { KawaseBlurPass } from "../passes/KawaseBlurPass.js";
import { MaterialPass } from "../passes/MaterialPass.js";
import { SceneRenderPass } from "../passes/SceneRenderPass.js";
import { Effect } from "./Effect.js";

const effectFragmentShader = `
uniform lowp sampler2D edgeTexture;
uniform lowp sampler2D maskTexture;

uniform vec3 visibleEdgeColor;
uniform vec3 hiddenEdgeColor;
uniform float pulse;
uniform float edgeStrength;

#ifdef USE_PATTERN
	uniform lowp sampler2D patternTexture;
	varying vec2 vUvPattern;
#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	vec2 edge = texture2D(edgeTexture, uv).rg;
	vec2 mask = texture2D(maskTexture, uv).rg;

	#ifndef X_RAY
		edge.y = 0.0;
	#endif

	edge *= (edgeStrength * mask.x * pulse);
	vec3 color = edge.x * visibleEdgeColor + edge.y * hiddenEdgeColor;

	float visibilityFactor = 0.0;

	#ifdef USE_PATTERN
		vec4 patternColor = texture2D(patternTexture, vUvPattern);

		#ifdef X_RAY
			float hiddenFactor = 0.5;
		#else
			float hiddenFactor = 0.0;
		#endif

		visibilityFactor = (1.0 - mask.y > 0.0) ? 1.0 : hiddenFactor;
		visibilityFactor *= (1.0 - mask.x) * patternColor.a;
		color += visibilityFactor * patternColor.rgb;
	#endif

	float alpha = max(max(edge.x, edge.y), visibilityFactor);

	#ifdef ALPHA
		outputColor = vec4(color, alpha);
	#else
		outputColor = vec4(color, max(alpha, inputColor.a));
	#endif
}
`;

const effectVertexShader = `
uniform float patternScale;

varying vec2 vUvPattern;

void mainSupport(const in vec2 uv) {
	vUvPattern = uv * vec2(aspect, 1.0) * patternScale;
}
`;

export class OutlineEffect extends Effect {

	constructor(scene, camera, {
		blendFunction = BlendFunction.SCREEN,
		patternTexture = null,
		patternScale = 1.0,
		edgeStrength = 1.0,
		pulseSpeed = 0.0,
		visibleEdgeColor = 0xffffff,
		hiddenEdgeColor = 0x22090a,
		kernelSize = KernelSize.VERY_SMALL,
		blur = false,
		xRay = true,
		multisampling = 0,
		resolutionScale = 0.5,
		resolutionX,
		resolutionY
	} = {}) {

		super("OutlineEffect", effectFragmentShader, {
			uniforms: new Map([
				["maskTexture", new Uniform(null)],
				["edgeTexture", new Uniform(null)],
				["edgeStrength", new Uniform(edgeStrength)],
				["visibleEdgeColor", new Uniform(new Color(visibleEdgeColor))],
				["hiddenEdgeColor", new Uniform(new Color(hiddenEdgeColor))],
				["pulse", new Uniform(1.0)],
				["patternScale", new Uniform(patternScale)],
				["patternTexture", new Uniform(null)]
			])
		});

		this.blendMode.addEventListener("change", () => {
			if (this.blendMode.blendFunction === BlendFunction.ALPHA) {
				this.defines.set("ALPHA", "1");
			} else {
				this.defines.delete("ALPHA");
			}
			this.setChanged();
		});

		this.blendMode.blendFunction = blendFunction;
		this.xRay = xRay;

		this.scene = scene;
		this.camera = camera;

		this.renderTargetMask = new WebGLRenderTarget(1, 1);
		this.renderTargetMask.samples = multisampling;
		this.renderTargetMask.texture.name = "Outline.Mask";
		this.uniforms.get("maskTexture").value = this.renderTargetMask.texture;

		this.renderTargetOutline = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetOutline.texture.name = "Outline.Edges";
		this.uniforms.get("edgeTexture").value = this.renderTargetOutline.texture;

		this.clearPass = new BufferClearPass();
		this.clearPass.overrideClearColor = new Color(0x000000);
		this.clearPass.overrideClearAlpha = 1;

		this.depthPass = new DepthPass(scene, camera);

		this.maskPass = new SceneRenderPass(scene, camera, new DepthComparisonMaterial(this.depthPass.texture, camera));
		this.maskPass.clearPass.overrideClearColor = new Color(0xffffff);
		this.maskPass.clearPass.overrideClearAlpha = 1;

		this.blurPass = new KawaseBlurPass({ resolutionScale, resolutionX, resolutionY, kernelSize });
		this.blurPass.enabled = blur;

		const resolution = this.blurPass.resolution;
		resolution.addEventListener("change", () => this.setSize(resolution.baseWidth, resolution.baseHeight));

		this.outlinePass = new MaterialPass(new OutlineEdgeMaterial());
		this.outlinePass.fullscreenMaterial.inputBuffer = this.renderTargetMask.texture;

		this.time = 0;
		this.forceUpdate = true;
		this.selection = new Selection();
		this.pulseSpeed = pulseSpeed;

		if (patternTexture !== null) {
			this.patternTexture = patternTexture;
		}
	}

	set mainScene(value) {
		this.scene = value;
		this.depthPass.mainScene = value;
		this.maskPass.mainScene = value;
	}

	set mainCamera(value) {
		this.camera = value;
		this.depthPass.mainCamera = value;
		this.maskPass.mainCamera = value;
		this.maskPass.overrideMaterial.copyCameraSettings(value);
	}

	get resolution() {
		return this.blurPass.resolution;
	}

	get multisampling() {
		return this.renderTargetMask.samples;
	}

	set multisampling(value) {
		this.renderTargetMask.samples = value;
		this.renderTargetMask.dispose();
	}

	get patternScale() {
		return this.uniforms.get("patternScale").value;
	}

	set patternScale(value) {
		this.uniforms.get("patternScale").value = value;
	}

	get edgeStrength() {
		return this.uniforms.get("edgeStrength").value;
	}

	set edgeStrength(value) {
		this.uniforms.get("edgeStrength").value = value;
	}

	get visibleEdgeColor() {
		return this.uniforms.get("visibleEdgeColor").value;
	}

	set visibleEdgeColor(value) {
		this.uniforms.get("visibleEdgeColor").value = value;
	}

	get hiddenEdgeColor() {
		return this.uniforms.get("hiddenEdgeColor").value;
	}

	set hiddenEdgeColor(value) {
		this.uniforms.get("hiddenEdgeColor").value = value;
	}

	get xRay() {
		return this.defines.has("X_RAY");
	}

	set xRay(value) {
		if (this.xRay !== value) {
			if (value) {
				this.defines.set("X_RAY", "1");
			} else {
				this.defines.delete("X_RAY");
			}
			this.setChanged();
		}
	}

	get patternTexture() {
		return this.uniforms.get("patternTexture").value;
	}

	set patternTexture(value) {
		if (value !== null) {
			this.defines.set("USE_PATTERN", "1");
			this.setVertexShader(effectVertexShader);
		} else {
			this.defines.delete("USE_PATTERN");
			this.setVertexShader(null);
		}
		this.uniforms.get("patternTexture").value = value;
		this.setChanged();
	}

	update(renderer, inputBuffer, deltaTime) {
		const scene = this.scene;
		const camera = this.camera;
		const selection = this.selection;
		const pulse = this.uniforms.get("pulse");

		const background = scene.background;
		const mask = camera.layers.mask;

		if (this.forceUpdate || selection.size > 0) {
			scene.background = null;
			pulse.value = 1;

			if (this.pulseSpeed > 0) {
				pulse.value = Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375 + 0.625;
			}

			this.time += deltaTime;

			selection.setVisible(false);
			this.depthPass.render(renderer);
			selection.setVisible(true);

			camera.layers.set(selection.layer);
			this.maskPass.render(renderer, this.renderTargetMask);

			camera.layers.mask = mask;
			scene.background = background;

			this.outlinePass.render(renderer, null, this.renderTargetOutline);

			if (this.blurPass.enabled) {
				this.blurPass.render(renderer, this.renderTargetOutline, this.renderTargetOutline);
			}
		}

		this.forceUpdate = selection.size > 0;
	}

	setSize(width, height) {
		this.blurPass.setSize(width, height);
		this.renderTargetMask.setSize(width, height);

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		const w = resolution.width;
		const h = resolution.height;

		this.depthPass.setSize(w, h);
		this.renderTargetOutline.setSize(w, h);
		this.outlinePass.fullscreenMaterial.setSize(w, h);
	}

	initialize(renderer, alpha, frameBufferType) {
		this.blurPass.initialize(renderer, alpha, UnsignedByteType);
		if (frameBufferType !== undefined) {
			this.depthPass.initialize(renderer, alpha, frameBufferType);
			this.maskPass.initialize(renderer, alpha, frameBufferType);
			this.outlinePass.initialize(renderer, alpha, frameBufferType);
		}
	}

}
