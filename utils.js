var _setTimeout = function(fn, timeout) {
    if (timeout === 'animation') {
        requestAnimationFrame(fn);
    } else {
        setTimeout(fn, timeout);
    }
};

export var throttle = function(fn, timeout) {
    var blocked = false;
    var called = false;
    var nextArgs = [];

    var wrapper = function(...args) {
        if (blocked) {
            called = true;
            nextArgs = args;
        } else {
            blocked = true;
            called = false;
            nextArgs = [];

            fn.apply(this, args);

            _setTimeout(() => {
                blocked = false;
                if (called) {
                    wrapper.apply(this, nextArgs);
                }
            }, timeout);
        }
    };

    return wrapper;
};
