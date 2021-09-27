### Vaccinate The States has shut down as of August 2, 2021. [Learn more →](shutdown-notice.md)

# Vaccinate The States 🇺🇸

Vaccinate The States is the web frontend for displaying vaccination sites across the US. It is static pages served with Jekyll
with vanilla JS on top. It consists of three main pages `index.html`, `embed.html`, and `about-us.html`. These pages are powered by their respective js files in `/webpack/pages`. The site supports the following query parameters:

- `zip={code}` zip code to center the map
- `lat={lat}&lng={lng}` latitude and longitude values to center the map
- `zoom={level}` zoom level to start the map at
- `pfizer=1` to display locations that provide Pfizer
- `jj=1` to display locations that provide J&J 
- `moderna=1` to display locations that provide Moderna
- `unknown=1` to display locations with unknown vaccine type

## How to begin local development on a Mac

### Set up Ruby 2.7

1. Install [Homebrew](https://brew.sh/) if you don't already have it
2. `brew install ruby-install chruby`
3. Source the `chruby.sh` and `auto.sh` scripts from chruby in `~/.zshrc` or `~/.bashrc`. `brew info chruby` for details. If chruby was installed user locally, that would like this:
```
source /usr/local/share/chruby/chruby.sh
source /usr/local/share/chruby/auto.sh
```
4. `ruby-install ruby 2.7.2`

### Set up Node 15.8.0

1. Install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if you don't already have it
2. `nvm install 15.8.0`
3. `nvm use 15.8.0`

### Start local development server
```
script/server
```

## How to begin local development on Windows 10

### Set up Ruby 2.7

1. Download and run [rubyinstaller-2.7.2-1-x64.exe](https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-2.7.2-1/rubyinstaller-2.7.2-1-x64.exe)

### Set up Node 15.8.0

1. Install [nvm](https://github.com/coreybutler/nvm-windows#install-nvm-windows) if you don't already have it
2. `nvm install 15.8.0`
3. `nvm use 15.8.0`

### Start local development server
```
script\server.ps1
```

## First time with Jekyll?

- [jekyll](https://jekyllrb.com/) is a Ruby-based static site generator. It is easy to pick up if you've worked in Ruby before.
  - You'll see [Liquid](https://shopify.github.io/liquid/) templating used a lot.
  - Jeykll starts on [localhost:4000](http://localhost:4000/) by default.
    - You will need to restart the Jekyll process when the config file changes; that is the only time you need to restart it _most_ of the time. (Other occasions include adding collections, etc, which you'll be doing extremely infrequently.)

## Running the linter
The linter - [Prettier](https://prettier.io/) - runs on every PR automatically. If you'd like to run it locally, run `npm install` once to set up npm and then `npm run lint:fix` to run the linter.

## Adding new data to the map
Data gets published to Mapbox via [Vial](https://github.com/CAVaccineInventory/vial/blob/main/docs/api.md#post-apiexportmapbox) 
on a regular cadence during business hours. We then provide Mapbox a recipe that determines what data gets displayed on the 
map in `mts/recipe.json`.  If we want to add more data to the map, we have to 1) update the mapbox export in VIAL to 
provide that data, 2) update the recipe to display that data on `vialLow` (zoomed out) or `vialHigh` (zoomed in), and 3) 
then publish the recipe via `export MAPBOX_TOKEN="TOKEN_HERE" && script/publish_mts_recipe`. Once the recipe is published, 
the map will be updated with the new properties on the next regular VIAL mapbox export.