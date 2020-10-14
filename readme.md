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
    - `HASH_SALT=...`
    - `SESSION_SECRET=...`
    - `PORT=...`
    - `ADMIN_USERNAME=...`
    - `ADMIN_PASSWORD=...`
- Run as dev with `npm run start` or `npm run watch`.
- Run on prod with `npm run build && <your_process_manager> dist/server.js`.

## Todo list

- **todo**: paginate admin page ⚠️
- **todo**: limit subscriptions by some technics ⚠️
- **todo**: implement socket.io for mention notifications (using mention API)
- **todo**: implement a live private chat between members (using socket.io too)
- **todo**: add fixtures for dev tests
- **todo**: add report button on posts and on users profile
- **todo**: show a preview of post content in post-card
- **todo**: make settings page (CRUD & RGPD, themes dark/light & theme color)
- **todo**: remove bootstrap and make a real SCSS theme from scratch
- **todo**: fix redirection (make a real History class to manage it)
- **todo**: remove session activity time on logout
- **todo**: allow user own custom shortcuts
- **todo**: implement right click on items (copy url, edit, delete, share, send to DM, copy ID)
- **todo**: implement right click on blank (open compact version of settings)
- **todo**: allow shortcuts to be public and private
- **todo**: make a "get" button on public shortcuts to get it
- **todo**: allow searching of shortcuts in search page
- **todo**: add a js tool page (regex tester, css selector tester, color picker, etc...)
- **todo**: add profile button and forum GitHub button in the header
