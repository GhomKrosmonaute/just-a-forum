<div align="center">
    <a href="https://just-a-forum.tk"><img src="./brand/logo_dark-blurple-blurple.png" width="200" alt="just-a-forum-logo" /></a>
    <h1> Just a Forॐ </h1>
  <p>
    <a href="https://discord.gg/3vC2XWK">
      <img src="https://img.shields.io/discord/507389389098188820?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://david-dm.org/CamilleAbella/just-a-forum">
      <img src="https://img.shields.io/david/CamilleAbella/just-a-forum.svg?maxAge=3600" alt="Dependencies" /></a>
  </p>
</div>

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
    - `PORT=4242`
    - `ADMINISTRATORS=id1,id2,id3`
- Run as dev with `npm run start` or `npm run watch`.
- Run on prod with `npm run build && <your_process_manager> dist/server.js`.

## Todo list

- paginate admin page ⚠️
- mail confirmation using [nodemailer](https://nodemailer.com/about/) ⚠️
- implement socket.io for mention notifications (using mention API)
- implement a live private chat between members (using socket.io too)
- add report button on posts and on users profile
- show a preview of post content in post-card
- make settings page (CRUD & RGPD, themes dark/light & theme color)
- allow user own custom shortcuts
- implement right click on items (copy url, edit, delete, share, send to DM, copy ID)
- implement right click on blank (open compact version of settings)
- allow shortcuts to be public and private
- make a "get" button on public shortcuts to get it
- allow searching of shortcuts in search page
- add a js tool page (regex tester, css selector tester, color picker, etc...)
- on profile of other user, show mutual friends
- make a deploy script on gulpfile:
    - send a Discord webhook with deployed branch/commit links and deployed site url
- add dropdowns on header
- add fixed side-bar with friend list
- add fixed chat-boxes (facebook-like) on bottom-right of viewport
- make possible user slugs in routes and show slugs on displayed url
- allow tabulation in textarea
- fix even username undefined bug
- add post edited date (and edit author if it is an administrator)
- add about page with changelogs and todo-list (fetched on github)
- allow auto scroll to focused list item on page reload
- allow sorting choice for all lists
- keep base query properties on login/subscribe redirection (like page number or sorting options)
- adapt for mobile:
    - convert some pages and partials views for mobile (prefix it with "m-")
    - detect device with [express-device](https://www.npmjs.com/package/express-device) for switch between mobile and desktop views
- generate scss class variants for landscape and portrait
- move all scss variables and lists inside a config.scss file
- display db weight, uptime and 21 last created users on admin page
- faker:
    - randomly add likes and links
    - fake accounts auto-accepts friend requests
    
