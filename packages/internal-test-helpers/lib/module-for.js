import { isFeatureEnabled } from 'ember-debug';
import applyMixins from './apply-mixins';

export default function moduleFor(description, TestClass, ...mixins) {
  let context;

  QUnit.module(description, {
    setup() {
      context = new TestClass();
      if (context.beforeEach) {
        return context.beforeEach();
      }
    },

    teardown() {
      context.teardown();
    }
  });

  applyMixins(TestClass, mixins);

  let proto = TestClass.prototype;

  while (proto !== Object.prototype) {
    Object.keys(proto).forEach(generateTest);
    proto = Object.getPrototypeOf(proto);
  }

  function generateTest(name) {
    if (name.indexOf('@test ') === 0) {
      QUnit.test(name.slice(5), assert => context[name](assert));
    } else if (name.indexOf('@skip ') === 0) {
      QUnit.skip(name.slice(5), assert => context[name](assert));
    } else {
      let match = /^@feature\((!?)([a-z-]+)\) /.exec(name);
      let shouldTest = match && isFeatureEnabled(match[2]);

      if (match && match[1] === '!') {
        shouldTest = !shouldTest;
      }

      if (shouldTest) {
        QUnit.test(name.slice(match[0].length), assert => context[name](assert));
      }
    }
  }
}
