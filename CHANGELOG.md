# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.6.2] - 2021-10-27

### Added

- Added support for FoundryVTT 0.8.8 - 0.8.9
- Added basic integration to the Levels module to ensure Hey, Wait! doesn't trigger on incorrect level

## [0.6.1] - 2021-06-16

### Added

- Added support for FoundryVTT 0.8.6 - 0.8.7.

## [0.6.0] - 2021-05-23

### Added

- Added support for FoundryVTT 0.8.5
- Ensure executed macros associated with Hey, Wait! tiles pass the relevant actor and token
- Add setting for "Token Disposition Types Allowed". This allows GMs to restrict the tokens which can trigger Hey, Wait! tiles dependant on their disposition. Defaults to "Friendly" only

### Changed

- Restructured more code to be more inline with the document system

## [0.5.1] - 2021-05-18

### Changed

- Added support for FoundryVTT 0.8.4
- Wrap document data changes in `preCreateTile` hook in correct update call. See https://gitlab.com/foundrynet/foundryvtt/-/issues/5126

## [0.5.0] - 2021-05-16

### Changed

- Added support for FoundryVTT 0.8.x. No backwards compatability for 0.7.x
- Overhauled how Hey, Wait! tiles are handled in the new version. Hey, Wait! tiles are seen as background, ground level tiles, and we bypass any overhead tile functionality
- No more patterning on Hey, Wait! tiles. Unfortunately, Pixi's `TilingSprite` is not working with the new tiling system for some reason. Will try to revisit later

## [0.4.0] - 2021-04-11

### Added

- Added "Warp Players" setting (defaulting to false) to configure if players should be warped to the scene where a Hey, Wait! tile was triggered
- Ability to associate a macro to a Hey, Wait! tile which is executed on trigger. This will always be executed as the GM

### Changed

- Fixed issue where "Hey, Wait!" was prepended to other form application windows
- Set "restrict GM" setting to be false to prevent confusion with new users trying the module out

## [0.3.0] - 2020-12-30

### Added

- Added reaction animations to Hey, Wait! tiles. Reactions are selected when placing a Hey, Wait! tile. You can choose an info, question, or exclamation reaction. Each one has a corresponding animation and sound effect
- Sound effects can be disabled in the module settings
- Accessibility support - red and green Hey, Wait! tile colours now include tiled symbols on them for visibility

### Changed
- Fixed issue where saving a Hey, Wait! tile would set the Tile image to the "stop" image

## [0.2.0] - 2020-12-23

### Added

- Now checks for collisions when players click and drag their tokens across a Hey, Wait! tile and triggers accordingly
- Potential performance improvements by now relying on Foundry's Ray functionality
- Performance monitoring for tile checking
- Partial tile squares (tiles that take up 0.5 or 0.25 of grid spaces) are now supported

## [0.1.1] - 2020-12-22

### Added

- Added new setting that allows restricting triggering the Hey, Wait! tiles to player token movement only

## [0.1.0] - 2020-12-21

### Added

- Allows GMs to place "Hey, Wait!" tiles. You can place these by clicking the :hand: icon in the tile controls toolbar. These differ from normal tiles in that when they're placed, any token that moves on top of them will trigger a pausing of the game, and everyone's canvases panning over to that token. This lets the GM explain a situation or an encounter
- "Hey, Wait!" tiles are red when they have not been triggered yet, and turn green once they have been triggered by tokens. Once triggered, they will not trigger again unless you reset the trigger by right-clicking on the token and clicking the :hand: button

### Limitations

- Rotations are not allowed as our collision code does not support it at the moment
- Depending on grid size, if you have a tile that "bleeds" onto other grid spaces, it may not be triggered. Currently only entirely covered grid spaces are guaranteed to trigger
- Accessibility right now is not great. Support for some sort of pattern on the triggered vs. not triggered tiles would be beneficial

[unreleased]: https://github.com/1000nettles/hey-wait/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/1000nettles/hey-wait/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/1000nettles/hey-wait/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/1000nettles/hey-wait/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/1000nettles/hey-wait/releases/tag/v0.1.0
