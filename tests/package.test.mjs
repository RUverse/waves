import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_WAVE_CONFIG,
  createWaveConfig,
  mountWave
} from '../lib-dist/index.js';

test('createWaveConfig normalizes partial and invalid input', () => {
  const config = createWaveConfig({
    seed: Number.NaN,
    waveCount: 99.6,
    amplitude: Number.POSITIVE_INFINITY,
    waveColor: '  ',
    vertexStep: 0,
    variations: { amplitude: 4, rotation: -2 }
  });

  assert.equal(config.seed, DEFAULT_WAVE_CONFIG.seed);
  assert.equal(config.amplitude, DEFAULT_WAVE_CONFIG.amplitude);
  assert.equal(config.waveCount, 30);
  assert.equal(config.waveColor, DEFAULT_WAVE_CONFIG.waveColor);
  assert.equal(config.vertexStep, 1);
  assert.equal(config.variations.amplitude, 1);
  assert.equal(config.variations.rotation, 0);
  assert.deepEqual(createWaveConfig(), DEFAULT_WAVE_CONFIG);
  assert.doesNotThrow(() => JSON.stringify(config));
});

test('the package can be imported without browser globals', () => {
  assert.equal(typeof mountWave, 'function');
  assert.throws(() => mountWave({}), /browser DOM/);
});

test('seeded rendering is deterministic and changes with the seed', () => {
  const env = installFakeDom();
  try {
    const input = {
      seed: 41,
      waveCount: 3,
      variations: { amplitude: 0.3, rotation: 0.08, spacing: 0.1 }
    };
    const first = new env.HTMLElement();
    const second = new env.HTMLElement();
    const third = new env.HTMLElement();

    const firstHandle = mountWave(first, input);
    const secondHandle = mountWave(second, input);
    const thirdHandle = mountWave(third, { ...input, seed: 42 });

    assert.deepEqual(first.children[0].context.calls, second.children[0].context.calls);
    assert.notDeepEqual(first.children[0].context.calls, third.children[0].context.calls);

    firstHandle.destroy();
    secondHandle.destroy();
    thirdHandle.destroy();
  } finally {
    env.restore();
  }
});

test('mounting, updating, replacing, and destroying clean up safely', () => {
  const env = installFakeDom();
  try {
    const host = new env.HTMLElement();
    const first = mountWave(host, { seed: 1 });
    assert.equal(host.children.length, 1);
    assert.equal(env.rafCallbacks.size, 1);

    env.intersectionObservers[0].callback([{ isIntersecting: false }]);
    assert.equal(env.rafCallbacks.size, 0);
    env.intersectionObservers[0].callback([{ isIntersecting: true }]);
    assert.equal(env.rafCallbacks.size, 1);

    const callsBeforeUpdate = host.children[0].context.calls.length;
    first.update({ seed: 2, waveCount: 2 });
    assert.equal(host.children.length, 1);
    assert.ok(host.children[0].context.calls.length > callsBeforeUpdate);

    const second = mountWave(host, { seed: 3 });
    assert.equal(host.children.length, 1);
    first.destroy();
    assert.equal(host.children.length, 1);

    second.destroy();
    second.destroy();
    assert.equal(host.children.length, 0);
    assert.equal(env.rafCallbacks.size, 0);
    assert.ok(env.resizeObservers.every((observer) => observer.disconnected));
    assert.ok(env.intersectionObservers.every((observer) => observer.disconnected));
  } finally {
    env.restore();
  }
});

test('reduced motion renders a static frame without scheduling animation', () => {
  const env = installFakeDom({ reducedMotion: true });
  try {
    const host = new env.HTMLElement();
    const handle = mountWave(host, { seed: 7 });
    assert.equal(env.rafCallbacks.size, 0);
    assert.ok(host.children[0].context.calls.length > 0);
    handle.destroy();
  } finally {
    env.restore();
  }
});

test('observer fallbacks use window resize and support multiple instances', () => {
  const env = installFakeDom({ observers: false });
  try {
    const one = new env.HTMLElement();
    const two = new env.HTMLElement();
    const first = mountWave(one);
    const second = mountWave(two);

    assert.equal(env.windowListeners.get('resize')?.size, 2);
    assert.equal(env.rafCallbacks.size, 2);

    first.destroy();
    second.destroy();
    assert.equal(env.windowListeners.get('resize')?.size, 0);
  } finally {
    env.restore();
  }
});

function installFakeDom({ reducedMotion = false, observers = true } = {}) {
  const previous = new Map();
  const keys = ['document', 'window', 'HTMLElement', 'ResizeObserver', 'IntersectionObserver'];
  keys.forEach((key) => previous.set(key, globalThis[key]));

  const rafCallbacks = new Map();
  const windowListeners = new Map();
  const resizeObservers = [];
  const intersectionObservers = [];
  let nextRafId = 1;

  class FakeHTMLElement {
    constructor() {
      this.children = [];
      this.clientWidth = 320;
      this.clientHeight = 180;
      this.parentNode = null;
      this.style = {};
      this.attributes = new Map();
    }

    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    }

    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) this.children.splice(index, 1);
      child.parentNode = null;
      return child;
    }

    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    }
  }

  class FakeContext {
    constructor(canvas) {
      this.canvas = canvas;
      this.calls = [];
    }

    record(name, values) {
      this.calls.push([name, ...values.map((value) =>
        typeof value === 'number' ? Math.round(value * 1e6) / 1e6 : value
      )]);
    }

    setTransform(...values) { this.record('setTransform', values); }
    clearRect(...values) { this.record('clearRect', values); }
    fillRect(...values) { this.record('fillRect', values); }
    beginPath(...values) { this.record('beginPath', values); }
    moveTo(...values) { this.record('moveTo', values); }
    lineTo(...values) { this.record('lineTo', values); }
    closePath(...values) { this.record('closePath', values); }
    stroke(...values) { this.record('stroke', values); }
    fill(...values) { this.record('fill', values); }
    save(...values) { this.record('save', values); }
    restore(...values) { this.record('restore', values); }
    drawImage(...values) { this.record('drawImage', values); }
  }

  class FakeCanvas extends FakeHTMLElement {
    constructor() {
      super();
      this.width = 0;
      this.height = 0;
      this.context = new FakeContext(this);
    }

    getContext(type) {
      return type === '2d' ? this.context : null;
    }
  }

  class FakeResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      resizeObservers.push(this);
    }
    observe() {}
    disconnect() { this.disconnected = true; }
  }

  class FakeIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      intersectionObservers.push(this);
    }
    observe() {}
    disconnect() { this.disconnected = true; }
  }

  const motionListeners = new Set();
  const motionQuery = {
    matches: reducedMotion,
    addEventListener(_type, callback) { motionListeners.add(callback); },
    removeEventListener(_type, callback) { motionListeners.delete(callback); }
  };

  const fakeWindow = {
    devicePixelRatio: 2,
    matchMedia() { return motionQuery; },
    requestAnimationFrame(callback) {
      const id = nextRafId++;
      rafCallbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) { rafCallbacks.delete(id); },
    addEventListener(type, callback) {
      if (!windowListeners.has(type)) windowListeners.set(type, new Set());
      windowListeners.get(type).add(callback);
    },
    removeEventListener(type, callback) {
      windowListeners.get(type)?.delete(callback);
    }
  };

  globalThis.HTMLElement = FakeHTMLElement;
  globalThis.document = {
    createElement(tagName) {
      return tagName === 'canvas' ? new FakeCanvas() : new FakeHTMLElement();
    }
  };
  globalThis.window = fakeWindow;
  if (observers) {
    globalThis.ResizeObserver = FakeResizeObserver;
    globalThis.IntersectionObserver = FakeIntersectionObserver;
  } else {
    delete globalThis.ResizeObserver;
    delete globalThis.IntersectionObserver;
  }

  return {
    HTMLElement: FakeHTMLElement,
    rafCallbacks,
    windowListeners,
    resizeObservers,
    intersectionObservers,
    restore() {
      keys.forEach((key) => {
        const value = previous.get(key);
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      });
    }
  };
}
