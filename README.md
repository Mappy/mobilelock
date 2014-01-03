# Mobile Lock

## Dependencies

You’ll need node, npm and bower (npm install -g bower).

## Install

To use it, you‘ll need to :
  1. launch `npm install` to install server dependencies,
  2. launch `bower install` to install client dependencies,
  3. then launch the server with `make run`,
  4. open your browser on `http://localhost:4400/`.

## Run in production

To run program as a service, run `make start` (and `make stop` to stop it).

## Develop

During development, you can use `make run` or `make debug`. Both will reload the app when a file changes.

You can launch unit test using `make unit` or `make tdd` (Unit test will be launch each time a test changes).