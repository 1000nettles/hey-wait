# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
