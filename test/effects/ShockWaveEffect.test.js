import { jest } from "@jest/globals";
import { ShockWaveEffect } from "../../src/effects/ShockWaveEffect.js";
import { PerspectiveCamera, Vector3 } from "three";

describe("ShockWaveEffect", () => {
	let camera;

	beforeEach(() => {
		camera = new PerspectiveCamera(75, 1, 0.1, 100);
		camera.position.set(0, 0, 5);
		camera.lookAt(0, 0, 0);
		camera.updateMatrixWorld();
	});

	test("can be instantiated", () => {
		const effect = new ShockWaveEffect(camera);
		expect(effect.name).toBe("ShockWaveEffect");
	});

	test("position defaults to origin", () => {
		const effect = new ShockWaveEffect(camera);
		expect(effect.position.x).toBe(0);
		expect(effect.position.y).toBe(0);
		expect(effect.position.z).toBe(0);
	});

	test("amplitude getter/setter works", () => {
		const effect = new ShockWaveEffect(camera, new Vector3(), { amplitude: 0.1 });
		expect(effect.amplitude).toBe(0.1);
		effect.amplitude = 0.2;
		expect(effect.amplitude).toBe(0.2);
	});

	test("waveSize getter/setter works", () => {
		const effect = new ShockWaveEffect(camera, new Vector3(), { waveSize: 0.5 });
		expect(effect.waveSize).toBe(0.5);
	});

	test("maxRadius getter/setter works", () => {
		const effect = new ShockWaveEffect(camera, new Vector3(), { maxRadius: 2.0 });
		expect(effect.maxRadius).toBe(2.0);
	});

	test("explode activates the effect", () => {
		const effect = new ShockWaveEffect(camera);
		expect(effect.uniforms.get("active").value).toBe(false);
		effect.explode();
		expect(effect.uniforms.get("active").value).toBe(true);
	});

	test("has vertex shader", () => {
		const effect = new ShockWaveEffect(camera);
		expect(effect.vertexShader).toBeTruthy();
		expect(effect.vertexShader).toContain("vSize");
	});

	test("fragment shader contains mainUv", () => {
		const effect = new ShockWaveEffect(camera);
		expect(effect.fragmentShader).toContain("mainUv");
	});

	test("speed can be set", () => {
		const effect = new ShockWaveEffect(camera, new Vector3(), { speed: 5.0 });
		expect(effect.speed).toBe(5.0);
	});
});
