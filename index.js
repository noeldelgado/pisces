import * as util from './Pisces/Util';

export default class Pisces {
  static defaults() {
    const duration = 600;
    const easing = t => Math.sqrt(1 - (--t * t));
    const callback = null;
    return { duration, easing, callback };
  }

  constructor(scrollingBox = util.getRoot(), options = {}) {
    this.scrollingBox = scrollingBox;
    this.options = Object.assign({}, Pisces.defaults(), options);
  }

  _getStart() {
    const { scrollLeft, scrollTop } = this.scrollingBox;
    return { x: scrollLeft, y: scrollTop };
  }

  _getMax() {
    const el = this.scrollingBox;
    let x;
    let y;
    if (util.isBody(el)) {
      x = (el.scrollWidth - window.innerWidth);
      y = (el.scrollHeight - window.innerHeight);
    } else {
      x = (el.scrollWidth - el.clientWidth);
      y = (el.scrollHeight - el.clientHeight);
    }

    return { x, y };
  }

  _animate(coords, options = {}) {
    const _this = this;
    const _options = Object.assign({}, _this.options, options);

    const start = performance.now();
    const step = function (timestamp) {
      const elapsed = Math.abs(timestamp - start);
      const progress = _options.easing(elapsed / _options.duration);
      _this.scrollingBox.scrollTop = (coords.start.y + coords.end.y * progress);
      _this.scrollingBox.scrollLeft = (coords.start.x + coords.end.x * progress);
      if (elapsed > _options.duration) _this._completed(coords, _options);
      else _this._RAF = requestAnimationFrame(step);
    };

    _this.cancel();
    _this._RAF = requestAnimationFrame(step);
    return this;
  }

  _completed(coords, options) {
    this.cancel();
    this.scrollingBox.scrollTop = (coords.start.y + coords.end.y);
    this.scrollingBox.scrollLeft = (coords.start.x + coords.end.x);
    if (util.isFunction(options.callback)) options.callback();
  }

  _getEndCoordinateValue(coord, start) {
    if (util.isNumber(coord)) return (coord - start);
    else if (util.isRelativeValue(coord)) return (start - (start - ~~coord));
    return 0;
  }

  scrollTo(target = null, options = {}) {
    const ERROR_MESSAGE = 'target param should be a HTMLElement or and ' +
      'object formatted as: {x: Number, y: Number}';

    if (util.isNull(target) || util.isUndefined(target)) {
      return console.error('target param is required');
    } else if (!util.isObject(target) && !util.isString(target)) {
      return console.error(ERROR_MESSAGE);
    }

    if (util.isString(target)) {
      const element = this.scrollingBox.querySelector(target);
      if (util.isElement(element)) {
        return this.scrollToElement(element, options);
      }

      return console.error(ERROR_MESSAGE);
    }

    if (util.isElement(target)) {
      return this.scrollToElement(target, options);
    }

    return this.scrollToPosition(target, options);
  }

  scrollToElement(element, options) {
    const start = this._getStart();
    const max = this._getMax();
    const end = (function (el) {
      let { top, left } = el.getBoundingClientRect();
      if (!util.isBody(el.offsetParent)) {
        const parentBounds = el.parentElement.getBoundingClientRect();
        top = (top - parentBounds.top);
        left = (left - parentBounds.left);
      }

      const x = (start.x + left < max.x) ? left : (max.x - start.x);
      const y = (start.y + top < max.y) ? top : (max.y - start.y);
      return { x, y };
    })(element);

    return this._animate({ start, end }, options);
  }

  scrollToPosition(coords, options) {
    const start = this._getStart();
    let x = (coords.hasOwnProperty('x')) ? coords.x : start.x;
    let y = (coords.hasOwnProperty('y')) ? coords.y : start.y;
    x = this._getEndCoordinateValue(x, start.x);
    y = this._getEndCoordinateValue(y, start.y);
    const end = { x, y };
    return this._animate({ start, end }, options);
  }

  scrollToTop(options) {
    const start = this._getStart();
    const end = { x: 0, y: -(start.y) };
    return this._animate({ start, end }, options);
  }

  scrollToBottom(options) {
    const start = this._getStart();
    const max = this._getMax();
    const end =  { x: 0, y: (max.y - start.y) };
    return this._animate({ start, end }, options);
  }

  scrollToLeft(options) {
    const start = this._getStart();
    const end =  { x: -(start.x), y: 0 };
    return this._animate({ start, end }, options);
  }

  scrollToRight(options) {
    const start = this._getStart();
    const max = this._getMax();
    const end =  { x: (max.x - start.x), y: 0 };
    return this._animate({ start, end }, options);
  }

  set(key, value) {
    this.options[key] = value;
    return this;
  }

  cancel() {
    this._RAF = cancelAnimationFrame(this._RAF);
    return this;
  }
};
