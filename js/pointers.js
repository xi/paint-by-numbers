export var registerPointerEvents = function(el, events) {
    var pointers = [];

    el.addEventListener('pointerdown', event => {
        if (pointers.length < 2 && (event.buttons & 1 || event.pointerType !== 'mouse')) {
            el.setPointerCapture(event.pointerId);

            // clone because offsetX/Y change to 0 on the original event
            pointers.push({
                id: event.pointerId,
                x: event.offsetX,
                y: event.offsetY,
            });

            events.down(pointers);
        }
    });

    el.addEventListener('pointermove', event => {
        var i = pointers.findIndex(e => e.id === event.pointerId);
        if (i !== -1) {
            pointers[i].x = event.offsetX;
            pointers[i].y = event.offsetY;
            events.move(pointers);
        }
    });

    var pointerup = function(event) {
        var i = pointers.findIndex(e => e.id === event.pointerId);
        if (i !== -1) {
            events.up(pointers);
            pointers = [];
        }
    };

    el.addEventListener('pointerup', pointerup);
    el.addEventListener('pointercancel', pointerup);
};
