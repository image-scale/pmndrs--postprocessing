import { jest } from "@jest/globals";
import { OverrideMaterialManager } from "../../src/core/OverrideMaterialManager.js";
import { MeshBasicMaterial } from "three";

describe("OverrideMaterialManager", () => {
	test("can be instantiated with null", () => {
		const mgr = new OverrideMaterialManager(null);
		expect(mgr).toBeTruthy();
	});

	test("can be instantiated with a material", () => {
		const mat = new MeshBasicMaterial();
		const mgr = new OverrideMaterialManager(mat);
		expect(mgr.material).toBe(mat);
	});

	test("workaroundEnabled static property defaults to false", () => {
		expect(OverrideMaterialManager.workaroundEnabled).toBe(false);
	});

	test("workaroundEnabled can be toggled", () => {
		OverrideMaterialManager.workaroundEnabled = true;
		expect(OverrideMaterialManager.workaroundEnabled).toBe(true);
		OverrideMaterialManager.workaroundEnabled = false;
		expect(OverrideMaterialManager.workaroundEnabled).toBe(false);
	});

	test("setMaterial updates the material", () => {
		const mgr = new OverrideMaterialManager(null);
		const mat = new MeshBasicMaterial();
		mgr.setMaterial(mat);
		expect(mgr.material).toBe(mat);
	});

	test("setMaterial with a material creates variant arrays", () => {
		const mat = new MeshBasicMaterial();
		const mgr = new OverrideMaterialManager(mat);
		expect(mgr.materials).toHaveLength(3);
		expect(mgr.materialsBackSide).toHaveLength(3);
		expect(mgr.materialsDoubleSide).toHaveLength(3);
		expect(mgr.materialsFlatShaded).toHaveLength(3);
		expect(mgr.materialsFlatShadedBackSide).toHaveLength(3);
		expect(mgr.materialsFlatShadedDoubleSide).toHaveLength(3);
	});

	test("dispose does not throw", () => {
		const mat = new MeshBasicMaterial();
		const mgr = new OverrideMaterialManager(mat);
		expect(() => mgr.dispose()).not.toThrow();
	});

	test("dispose clears original materials map", () => {
		const mgr = new OverrideMaterialManager(null);
		mgr.originalMaterials.set("test", "value");
		mgr.dispose();
		expect(mgr.originalMaterials.size).toBe(0);
	});

	test("setMaterial(null) when already null is safe", () => {
		const mgr = new OverrideMaterialManager(null);
		expect(() => mgr.setMaterial(null)).not.toThrow();
	});
});
