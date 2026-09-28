---
name: imagegen
description: Generate or edit raster image assets for MeditActive, matching the project's established visual language and saving verified results inside the repository.
---

# MeditActive image generation

Use this skill when the user asks to create or edit a raster illustration, image, texture, mockup, or transparent-background asset for MeditActive.

## Workflow

1. Inspect the destination component and the relevant existing assets before defining the image direction.
2. Identify the composition, intended placement, aspect ratio, background treatment, and responsive constraints.
3. Match the MeditActive visual language: friendly flat illustrations, soft rounded shapes, minimal facial features, and a warm palette centered on dark green `#3b6a4f`, light green `#7fc87b`, orange `#e26a08`, yellow, cream, and soft pink.
4. Use the available image-generation tool. For a new image, describe the established style in the prompt instead of copying a particular existing composition. For an edit, inspect and attach every target image required by the request.
5. Prefer PNG with a transparent background for isolated characters or objects used in the React interface. Avoid embedded text unless the user explicitly requests it.
6. Save the final asset under `src/assets/img/` using a descriptive snake_case filename consistent with the repository.
7. Inspect the generated image visually and verify its file type, dimensions, transparency when requested, and repository status. Iterate when visible defects would affect normal use, especially malformed hands, unintended text, unwanted backgrounds, or cropped subjects.
8. Do not modify a component, stylesheet, dependency, or build configuration unless the user has separately approved that change.

## Access handling

If the generator writes outside the accessible workspace, request access only to the exact generated file. Use an exact source and destination path; never request broad directory access or recursive permission changes.

## Completion report

Report the created asset path, its dimensions and format, the visual checks performed, and any remaining integration work.
