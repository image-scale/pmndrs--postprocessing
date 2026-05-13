import { jest } from "@jest/globals";
import { Selection } from "../../src/core/Selection.js";
import { Object3D, Layers } from "three";

function makeObject() {
	return new Object3D();
}

describe("Selection", () => {
	test("can be instantiated", () => {
		expect(new Selection()).toBeTruthy();
	});

	test("extends Set", () => {
		const s = new Selection();
		expect(s).toBeInstanceOf(Set);
	});

	test("has a layer assigned >= 2", () => {
		const s = new Selection();
		expect(s.layer).toBeGreaterThanOrEqual(2);
	});

	test("auto-increments layers for each new Selection", () => {
		const s1 = new Selection();
		const s2 = new Selection();
		expect(s2.layer).toBeGreaterThan(s1.layer);
	});

	test("can use a custom layer", () => {
		const s = new Selection(undefined, 10);
		expect(s.layer).toBe(10);
	});

	test("add enables the layer on the object", () => {
		const s = new Selection();
		const obj = makeObject();
		s.add(obj);
		expect(obj.layers.mask & (1 << s.layer)).not.toBe(0);
		expect(s.has(obj)).toBe(true);
	});

	test("delete disables the layer on the object", () => {
		const s = new Selection();
		const obj = makeObject();
		s.add(obj);
		s.delete(obj);
		expect(s.has(obj)).toBe(false);
		expect(obj.layers.mask & (1 << s.layer)).toBe(0);
	});

	test("toggle adds then removes", () => {
		const s = new Selection();
		const obj = makeObject();
		const added = s.toggle(obj);
		expect(added).toBe(true);
		expect(s.has(obj)).toBe(true);
		const removed = s.toggle(obj);
		expect(removed).toBe(false);
		expect(s.has(obj)).toBe(false);
	});

	test("clear disables layer on all objects and empties the set", () => {
		const s = new Selection();
		const objs = [makeObject(), makeObject(), makeObject()];
		for (const obj of objs) s.add(obj);
		expect(s.size).toBe(3);
		s.clear();
		expect(s.size).toBe(0);
		for (const obj of objs) {
			expect(obj.layers.mask & (1 << s.layer)).toBe(0);
		}
	});

	test("exclusive mode uses layers.set instead of layers.enable", () => {
		const s = new Selection();
		s.exclusive = true;
		const obj = makeObject();
		s.add(obj);
		expect(obj.layers.mask).toBe(1 << s.layer);
	});

	test("setVisible toggles layer 0 visibility", () => {
		const s = new Selection();
		const obj = makeObject();
		s.add(obj);
		s.setVisible(false);
		expect(obj.layers.mask & 1).toBe(0);
		s.setVisible(true);
		expect(obj.layers.mask & 1).toBe(1);
	});

	test("set replaces all objects", () => {
		const s = new Selection();
		const obj1 = makeObject();
		const obj2 = makeObject();
		const obj3 = makeObject();
		s.add(obj1);
		s.set([obj2, obj3]);
		expect(s.has(obj1)).toBe(false);
		expect(s.has(obj2)).toBe(true);
		expect(s.has(obj3)).toBe(true);
	});
});
