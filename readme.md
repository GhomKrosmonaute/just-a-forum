# Forॐ - Just a recursive forum

## How to use it ?

- Clone this repository.
- Install build tools if you don't have it.
    - Windows: To install the necessary prerequisites on Windows, the easiest is to simply run the following command, under an administrative command prompt or powershell: `npm i -g --add-python-to-path --vs2015 --production windows-build-tools`.
    - Linux: As for the C++ build tools, that's installed using the simple command: `sudo apt-get install build-essential`.
    - Mac:
        - Install [XCode](https://developer.apple.com/xcode/download/).
        - Once XCode is installed, go to **Preferences**, **Downloads**, and install the **Command Line Tools**.
- Install dependencies with npm.
- Make a **.env** file with this lines inside:
    - `JWT_SECRET=...`
    - `HASH_SALT=...`
    - `SESSION_SECRET=...`
    - `PORT=...`
    - `ADMIN_USERNAME=...`
    - `ADMIN_PASSWORD=...`
- Run as dev with `npm run start` or `npm run watch`.
- Run on prod with `npm run build && <your_process_manager> dist/server.js`.

## Todo list

- **todo**: implement socket.io for mention notifications
- **todo**: implement a live private chat between members (using socket.io too)
- **todo**: paginate wall page and search page or show a limited count of items ⚠️
- **todo**: popup on hover of reactions for displaying of reaction authors
- **todo**: add title attributes for describe button effects
- **todo**: use markdown-it (and highlightjs) for post contents and allow markdown in posts !
- **todo**: limit subscriptions by some technics ⚠️
- **todo**: add fixtures for dev tests