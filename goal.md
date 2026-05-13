# Goal

## Project
postprocessing — a javascript project.

## Description
A post-processing library for three.js that provides a pipeline of fullscreen image effects. The library introduces an EffectComposer that manages render passes, and an EffectPass that efficiently merges multiple effects into a single shader program. It includes core infrastructure (Resolution manager, Selection set, Timer, Gaussian kernel generator), a comprehensive set of shader materials, over 30 visual effects (bloom, blur, vignette, tone mapping, color grading, etc.), various render passes (clear, copy, mask, depth, blur, luminance), texture utilities (noise textures, LUT lookup textures, SMAA images), and file loaders for LUT formats (.3dl, .cube).

## Scope
- ~90 production source files to implement across core, enums, materials, effects, passes, textures, and loaders
- ~90 test files to write
- Reproduce all source code, tests, and configuration
