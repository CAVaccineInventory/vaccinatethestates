# Vaccinate The States 🇺🇸

## How to begin local development

### Setup with Ruby 2.7
- Start local development server with `script/server`

### First time with Jekyll?

- [jekyll](https://jekyllrb.com/) is a Ruby-based static site generator. It is easy to pick up if you've worked in Ruby before.
  - You'll see [Liquid](https://shopify.github.io/liquid/) templating used a lot.
  - Jeykll starts on [localhost:4000](http://localhost:4000/) by default.
    - You will need to restart the Jekyll process when the config file changes; that is the only time you need to restart it _most_ of the time. (Other occasions include adding collections, etc, which you'll be doing extremely infrequently.)

### Running the linter
The linter - [Prettier](https://prettier.io/) - runs on every PR automatically. If you'd like to run it locally, run `npm install` once to set up npm and then `npm run lint:fix` to run the linter. 
