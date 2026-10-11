# A Little Universe

An interactive birthday story made by Irfan. Eight small chapters move from a secret invitation to a starry celebration.

## Run locally

```sh
npm install
npm run dev
```

The site is a React and TypeScript app built with Vite. GSAP and ScrollTrigger handle the chapter reveals. The ambient star field and cake illustration are kept light so the experience works well on phones and without a WebGL-capable device.

Music is enabled by default and begins automatically when the browser allows it. If autoplay is blocked, the first tap, click, or keypress starts the soundtrack, including the tap that opens the invitation. The top-right music button can fade it out or back in at any time. The bundled piano-and-strings score is “Ambient Piano and Strings” by Good_B_Music, included under the [Pixabay Content License](https://pixabay.com/service/license-summary/); see the [track page](https://pixabay.com/music/beautiful-plays-ambient-piano-and-strings-10711/).

## Edit the messages

Update names, chapter labels, wishes, discoveries, and the letter in `src/content.ts`. Theme and layout tokens live near the top of `src/styles.css`.

## Project design

The accepted visual concepts for each chapter are in [`design/concepts`](design/concepts). Generated scene artwork used by the running app is in `public/art`.
# birthdayweb
