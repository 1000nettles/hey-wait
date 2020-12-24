# Hey, Wait! :raised_hand:

![Downloads](https://img.shields.io/github/downloads/1000nettles/hey-wait/latest/hey-wait-v0.2.0.zip?style=flat-square)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fhey-wait&style=flat-square)
![Issues](https://img.shields.io/github/issues/1000nettles/hey-wait?style=flat-square)
![MIT License](https://img.shields.io/github/license/1000nettles/hey-wait?style=flat-square)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G82ZNNS)

“Hey, Wait!” is a FoundryVTT module allowing a GM to place “event triggers” as tiles on a scene. When players collide with these triggers, the game pauses and the scene shifts to the player, allowing a GM to explain the theatre-of-the-mind landscape, if the player has ran into a pack of monsters, or anything else you can think of! The intent is to give GMs a bit of breathing room with a pack of players who love to explore.

## What Does This Look Like? :eyes:

On the left, we see the GM's screen where they have placed a Hey, Wait! tile (shown in red.) On the right, we see the player's screen, where they are unable to see the tile. After a collision into the Hey, Wait! tile, the game pauses and pans over to the player who triggered the tile. When a tile is triggered, it turns green. Hey, Wait! also picks up if a player has dragged their token across the scene.

![Hey, Wait! preview](img/preview1.gif)

Thanks to [Neutral Party](https://www.patreon.com/neutralparty) for the sample background map above.

## Instructions :scroll:

Start by installing the module, and enabling it for your world. If you click on the Tile button in the toolbar, you'll see a new button added denoted by a :hand:. This is the same as the Tile creation tool, except it's used to create Hey, Wait! tiles. These tiles are hidden "triggers" which, when a player steps on them with the token they're moving, will trigger a game pause and pans all players' views over to them. You are still able to use the normal tile functionality in FoundryVTT.

![Hey, Wait! in the toolbar](img/preview2.jpg)

You can also toggle the triggered state of the Hey, Wait! tile. Right-click on the tile and toggle it like so:

![Hey, Wait! tile toggling](img/preview3.gif)

Note that the visibility button has disappeared. Hey, Wait! tiles are always invisible to players.

## Settings :ballot_box_with_check:

* **Restrict GM from Triggering Tiles:** If enabled, triggering of the Hey, Wait! tiles will be locked down to only player's token movement and not the GM

## Known Limitations :x:

* No rotation allowed on Hey, Wait! tiles
* Accessibility issues - red and green aren't the best colours to use here. Eventually we'd like to move to the Hey, Wait! tiles having some sort of pattern in them denoting the tile's triggered status

## Future Planned Features :crystal_ball:

* Animation on token when triggering tiles
* Sound effects when triggering tiles
* Accessibility improvements
* ...please suggest some!

## Acknowledgements :wave:

* Thanks to [Game-icons.net](https://game-icons.net) for the use of the ["Halt" icon](https://game-icons.net/1x1/skoll/halt.html), and the ["Confirmed" icon](https://game-icons.net/1x1/delapouite/confirmed.html``)
