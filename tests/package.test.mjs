import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_WAVE_CONFIG,
  createWaveConfig,
  decodeWaveConfig,
  encodeWaveConfig,
  mountWave
} from '../lib-dist/index.js';

const COMPLETE_CONFIG_INPUT = {
  seed: 42,
  amplitude: 52.125,
  wavelength: 0.03,
  frequency: 0.75,
  period: 0.04,
  rotation: 15,
  curvature: 0.2,
  glitch: 0.3,
  spacing: 1.2,
  thickness: 8,
  taper: 0.4,
  waveCount: 7,
  waveColor: 'rgba(255, 240, 220, 0.5)',
  backgroundColor: 'transparent',
  vertexStep: 3,
  variations: {
    amplitude: 0.1,
    wavelength: 0.2,
    frequency: 0.3,
    period: 0.4,
    rotation: 0.5,
    curvature: 0.6,
    spacing: 0.7,
    thickness: 0.8
  }
};

test('waves:v1 defaults are an explicit frozen format snapshot', () => {
  assert.deepEqual(DEFAULT_WAVE_CONFIG, {
    seed: 0,
    amplitude: 40,
    wavelength: 0.02,
    frequency: 0.5,
    period: 0.05,
    rotation: 0,
    curvature: 0,
    glitch: 0,
    spacing: 1,
    thickness: 4,
    taper: 0,
    waveCount: 5,
    waveColor: '#ffffff',
    backgroundColor: '#000000',
    vertexStep: 5,
    variations: {
      amplitude: 0,
      wavelength: 0,
      frequency: 0,
      period: 0,
      rotation: 0,
      curvature: 0,
      spacing: 0,
      thickness: 0
    }
  });
  assert.equal(Object.isFrozen(DEFAULT_WAVE_CONFIG), true);
  assert.equal(Object.isFrozen(DEFAULT_WAVE_CONFIG.variations), true);
});

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

test('encodeWaveConfig emits exact canonical v1 output', () => {
  assert.equal(encodeWaveConfig(), 'waves:v1:{}');
  assert.throws(
    () => encodeWaveConfig('waves:v1:{"s":5}'),
    /requires an object configuration/
  );
  assert.equal(
    encodeWaveConfig(COMPLETE_CONFIG_INPUT),
    'waves:v1:{"s":42,"a":52.125,"w":0.03,"f":0.75,"p":0.04,"r":15,"c":0.2,"g":0.3,"sp":1.2,"th":8,"tp":0.4,"n":7,"wc":"rgba(255, 240, 220, 0.5)","bg":"transparent","vs":3,"v":{"a":0.1,"w":0.2,"f":0.3,"p":0.4,"r":0.5,"c":0.6,"sp":0.7,"th":0.8}}'
  );
  assert.equal(
    encodeWaveConfig({ amplitude: 40, seed: 9, variations: { thickness: 0.25 } }),
    'waves:v1:{"s":9,"v":{"th":0.25}}'
  );
});

test('codec encoding is deterministic and round trips every field', () => {
  const reordered = {
    variations: {
      thickness: 0.8,
      spacing: 0.7,
      curvature: 0.6,
      rotation: 0.5,
      period: 0.4,
      frequency: 0.3,
      wavelength: 0.2,
      amplitude: 0.1
    },
    vertexStep: 3,
    backgroundColor: 'transparent',
    waveColor: 'rgba(255, 240, 220, 0.5)',
    waveCount: 7,
    taper: 0.4,
    thickness: 8,
    spacing: 1.2,
    glitch: 0.3,
    curvature: 0.2,
    rotation: 15,
    period: 0.04,
    frequency: 0.75,
    wavelength: 0.03,
    amplitude: 52.125,
    seed: 42
  };
  const encoded = encodeWaveConfig(COMPLETE_CONFIG_INPUT);

  assert.equal(encodeWaveConfig(reordered), encoded);
  assert.deepEqual(decodeWaveConfig(encoded), createWaveConfig(COMPLETE_CONFIG_INPUT));
  assert.deepEqual(decodeWaveConfig(` \n${encoded}\t `), createWaveConfig(COMPLETE_CONFIG_INPUT));
  assert.deepEqual(decodeWaveConfig('waves:v1:{"n":999,"v":{"a":2}}'),
    createWaveConfig({ waveCount: 999, variations: { amplitude: 2 } }));
});

test('decodeWaveConfig rejects unsupported, malformed, and unknown payloads', () => {
  const invalidValues = [
    null,
    'waves:v2:{}',
    'waves:v1x:{}',
    'wave:v1:{}',
    'waves:v1:',
    'waves:v1:{',
    'waves:v1:null',
    'waves:v1:[]',
    'waves:v1:1',
    'waves:v1:"config"',
    'waves:v1:{"unknown":1}',
    'waves:v1:{"__proto__":{}}',
    'waves:v1:{"s":1e999}',
    'waves:v1:{"s":"1"}',
    'waves:v1:{"a":null}',
    'waves:v1:{"wc":1}',
    'waves:v1:{"bg":"  "}',
    'waves:v1:{"v":null}',
    'waves:v1:{"v":[]}',
    'waves:v1:{"v":1}',
    'waves:v1:{"v":{"unknown":1}}',
    'waves:v1:{"v":{"a":"0.5"}}'
  ];

  for (const value of invalidValues) {
    assert.throws(() => decodeWaveConfig(value), TypeError, String(value));
  }

  for (const alias of ['s', 'a', 'w', 'f', 'p', 'r', 'c', 'g', 'sp', 'th', 'tp', 'n', 'vs']) {
    assert.throws(
      () => decodeWaveConfig(`waves:v1:${JSON.stringify({ [alias]: 'invalid' })}`),
      TypeError,
      alias
    );
  }
  for (const alias of ['a', 'w', 'f', 'p', 'r', 'c', 'sp', 'th']) {
    assert.throws(
      () => decodeWaveConfig(`waves:v1:${JSON.stringify({ v: { [alias]: null } })}`),
      TypeError,
      `v.${alias}`
    );
  }
});

test('the package can be imported without browser globals', () => {
  assert.equal(typeof mountWave, 'function');
  assert.equal(encodeWaveConfig({ seed: 7 }), 'waves:v1:{"s":7}');
  assert.equal(decodeWaveConfig('waves:v1:{"s":7}').seed, 7);
  assert.throws(() => mountWave({}), /browser DOM/);
});

test('mounting an object and its encoded string produces equivalent canvas calls', () => {
  const env = installFakeDom();
  try {
    const objectHost = new env.HTMLElement();
    const stringHost = new env.HTMLElement();
    const objectHandle = mountWave(objectHost, COMPLETE_CONFIG_INPUT);
    const stringHandle = mountWave(stringHost, encodeWaveConfig(COMPLETE_CONFIG_INPUT));

    assert.deepEqual(
      objectHost.children[0].context.calls,
      stringHost.children[0].context.calls
    );

    objectHandle.destroy();
    stringHandle.destroy();
  } finally {
    env.restore();
  }
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

test('string updates replace the full config while object updates remain partial merges', () => {
  const env = installFakeDom();
  try {
    const initial = {
      seed: 3,
      amplitude: 75,
      wavelength: 0.08,
      waveCount: 4,
      waveColor: '#abcdef',
      variations: { amplitude: 0.4, rotation: 0.2 }
    };

    const objectHost = new env.HTMLElement();
    const objectHandle = mountWave(objectHost, initial);
    const beforeObjectUpdate = objectHost.children[0].context.calls.length;
    objectHandle.update({ seed: 4 });

    const expectedMergedHost = new env.HTMLElement();
    const expectedMergedHandle = mountWave(expectedMergedHost, { ...initial, seed: 4 });
    assert.deepEqual(
      objectHost.children[0].context.calls.slice(beforeObjectUpdate),
      expectedMergedHost.children[0].context.calls
    );

    const stringHost = new env.HTMLElement();
    const stringHandle = mountWave(stringHost, initial);
    const beforeStringUpdate = stringHost.children[0].context.calls.length;
    const replacement = encodeWaveConfig({ seed: 8, waveCount: 2 });
    stringHandle.update(replacement);

    const expectedReplacementHost = new env.HTMLElement();
    const expectedReplacementHandle = mountWave(expectedReplacementHost, replacement);
    assert.deepEqual(
      stringHost.children[0].context.calls.slice(beforeStringUpdate),
      expectedReplacementHost.children[0].context.calls
    );

    objectHandle.destroy();
    expectedMergedHandle.destroy();
    stringHandle.destroy();
    expectedReplacementHandle.destroy();
  } finally {
    env.restore();
  }
});

test('failed string updates leave the mounted wave unchanged and operational', () => {
  const env = installFakeDom();
  try {
    const initial = {
      seed: 12,
      amplitude: 66,
      waveCount: 3,
      variations: { spacing: 0.25 }
    };
    const host = new env.HTMLElement();
    const handle = mountWave(host, initial);
    const canvas = host.children[0];
    const callsBeforeFailure = [...canvas.context.calls];

    assert.throws(() => handle.update('waves:v1:{"a":"invalid"}'), TypeError);
    assert.equal(host.children.length, 1);
    assert.equal(host.children[0], canvas);
    assert.deepEqual(canvas.context.calls, callsBeforeFailure);
    assert.equal(env.rafCallbacks.size, 1);

    const beforeRecovery = canvas.context.calls.length;
    handle.update({ seed: 13 });
    const expectedHost = new env.HTMLElement();
    const expectedHandle = mountWave(expectedHost, { ...initial, seed: 13 });
    assert.deepEqual(
      canvas.context.calls.slice(beforeRecovery),
      expectedHost.children[0].context.calls
    );

    handle.destroy();
    expectedHandle.destroy();
  } finally {
    env.restore();
  }
});

test('failed string remounts preserve the existing instance', () => {
  const env = installFakeDom();
  try {
    const host = new env.HTMLElement();
    const handle = mountWave(host, { seed: 21 });
    const canvas = host.children[0];

    assert.throws(() => mountWave(host, 'waves:v2:{}'), TypeError);
    assert.equal(host.children.length, 1);
    assert.equal(host.children[0], canvas);
    assert.equal(env.rafCallbacks.size, 1);

    handle.destroy();
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
