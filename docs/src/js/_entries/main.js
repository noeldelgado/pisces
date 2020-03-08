import Pisces from '../../../../';

import Gemini from 'gemini-scrollbar';
import TextGradient from 'text-gradient';
import ShareUrl from 'share-url';
import Tween from 'tween.js';

const version = Pisces.VERSION;

// print pisces version
let versionElement = [].slice.call(document.querySelectorAll('.version'));
versionElement.map(el => {
  el.innerHTML = `v${version}`;
  el.classList.remove('hide');
});
versionElement = null;

// set gradient text-gradient
[].slice.call(document.querySelectorAll('.-grad')).forEach(i => {
  new TextGradient(i, {
    from: '#6B6ED8', to: 'rgb(74, 197, 195)'
  });
}
                                                          )
// init and cache
const scrollingBox = document.querySelector('.demo-scrolling-box');
const gemini = new Gemini({
  element: scrollingBox,
  createElements: false
}).create();
const pisces = new Pisces(gemini.getViewElement());

const form = document.querySelector('#demo-form');
const output = document.getElementById('output');
const scrollToOption = document.getElementById('scroll-to-option');

const items = document.querySelectorAll('.demo-scrolling-box li');
const itemsOptions = document.getElementById('scroll-to-element');
const elementsOptions = document.getElementById('elements-select-wrapper');
const coordOptions = document.getElementById('coords-input-wrapper');
const coordX = document.getElementById('coord-x');
const coordY = document.getElementById('coord-y');
const easesOptgroup = document.querySelector('optgroup[label="eases"]');
const easingOption = document.getElementById('easing-option');
const reDot = new RegExp(/\./);
const durationOption = document.getElementById('duration-option');

// create Tween.js easing options
const TweenEasings = Tween.Easing;
const tweenjsOptgroup = document.createElement('optgroup');
tweenjsOptgroup.label = 'tween.js';
Object.keys(TweenEasings).forEach(function(e) {
  Object.keys(TweenEasings[e]).forEach(function(o) {
    const option = document.createElement('option');
    option.value = `Tween.Easing.${e}.${o}`;
    option.text = `${e}.${o}`;
    tweenjsOptgroup.appendChild(option);
  });
});
easingOption.appendChild(tweenjsOptgroup);

// create sharable urls
const t = {
  related: 'pixelia_me',
  text: `pisces ${version} — Scroll to locations of any scrolling box in a smooth fashion `,
  url: 'http://noeldelgado.github.io/pisces/',
  via: 'pixelia_me'
};
document.querySelector('.js-share-twitter').href = ShareUrl.twitter(t);

const f = {
  u: 'http://noeldelgado.github.io/pisces/'
};
document.querySelector('.js-share-facebook').href = ShareUrl.facebook(f);


function formSubmitHandler(ev) {
  ev.preventDefault();

  const options = {};

  if (durationOption.value) {
    options.duration = durationOption.value;
  }

  if (easingOption.value !== 'default') {
    let ease;
    easingOption.value.split(reDot).forEach(i => {
      ease = (typeof window[i] === 'undefined') ? ease[i] : window[i];
    });
    options.easing = ease;
  }

  switch(scrollToOption.value) {
    case 'element':
      const el = items[(itemsOptions.value || 15) - 1];
      pisces.scrollToElement(el, options);
      break;
    case 'position':
      const coords = {x: coordX.value, y: coordY.value};
      pisces.scrollToPosition(coords, options);
      break;
    default:
      pisces[scrollToOption.value](options);
      break;
  }

  return false;
}

function changeHandler(ev) {
  elementsOptions.style.display = "none";
  itemsOptions.disabled = true;
  coordOptions.style.display = "none";

  switch(ev.target.value) {
    case 'element':
      elementsOptions.style.display = "";
      itemsOptions.disabled = false;
      break;
    case 'position':
      coordOptions.style.display = "";
      break;
  }
}

form.addEventListener('submit', formSubmitHandler);
scrollToOption.addEventListener('change', changeHandler);
