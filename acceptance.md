# Acceptance Criteria

## Task 1: EffectComposer pipeline with Pass base class and core enums

### Acceptance Criteria
- [ ] All 16 enums are defined with correct values: BlendFunction (33 values 0-32), ColorChannel (4 values), DepthCopyMode (2 values), DepthTestStrategy (3 values), EdgeDetectionMode (3 values), EffectAttribute (3 bitfield values), EffectShaderSection (5 string values), GlitchMode (4 values), KernelSize (6 values), LUTOperation (1 string value), MaskFunction (4 values), PredicationMode (3 values), SMAAPreset (4 values), ToneMappingMode (9 values), VignetteTechnique (2 values), WebGLExtension (4 string values)
- [ ] Timer can be instantiated and tracks delta/elapsed time in seconds with timescale support
- [ ] Timer supports fixed delta mode and auto-reset on visibility change
- [ ] Pass can be instantiated with name, scene, camera and has static fullscreen triangle geometry
- [ ] Pass has renderToScreen getter/setter that inverts the rtt flag
- [ ] Pass has fullscreenMaterial getter/setter that creates a fullscreen mesh with shared geometry
- [ ] Pass has needsSwap, needsDepthBlit, needsDepthTexture, enabled properties
- [ ] Pass.dispose() cleans up owned WebGLRenderTargets, Materials, Textures
- [ ] EffectComposer can be instantiated with optional renderer and options (depthBuffer, stencilBuffer, multisampling, frameBufferType)
- [ ] EffectComposer manages inputBuffer/outputBuffer as WebGLRenderTarget pair
- [ ] EffectComposer.addPass() inserts passes, manages renderToScreen flag, creates depth texture if needed
- [ ] EffectComposer.removePass() removes passes and adjusts renderToScreen
- [ ] EffectComposer.render() iterates enabled passes, swaps buffers on needsSwap
- [ ] EffectComposer.setSize() resizes renderer, buffers, and all passes
- [ ] EffectComposer.dispose() cleans up all passes and buffers
- [x] All classes are properly exported from a main index module

## Task 2: Resolution manager and Selection set

### Acceptance Criteria
- [ ] Resolution can be instantiated with null resizable, auto-size width/height, and default scale 1.0
- [ ] Resolution tracks base dimensions (baseWidth/baseHeight) via setBaseSize
- [ ] Resolution computes effective size using scale when both preferred dimensions are AUTO_SIZE (-1)
- [ ] Resolution computes effective size directly when both preferred dimensions are set explicitly
- [ ] Resolution computes missing dimension from aspect ratio when only one preferred dimension is set
- [ ] Resolution dispatches "change" events when base size, preferred size, or scale changes
- [ ] Resolution calls resizable.setSize when change event fires (if resizable is provided)
- [ ] Resolution.AUTO_SIZE is a static constant equal to -1
- [ ] Selection can be instantiated and extends Set
- [ ] Selection manages render layer assignment (auto-incrementing from layer 2)
- [ ] Selection.add() enables the assigned layer on added three.js objects
- [ ] Selection.delete() disables the assigned layer on removed objects
- [ ] Selection.toggle() adds if not present, removes if present
- [ ] Selection.clear() disables layer on all objects and clears the set
- [ ] Selection supports exclusive mode where add uses layers.set() instead of layers.enable()
- [ ] Selection.setVisible() toggles layer 0 on all selected objects
