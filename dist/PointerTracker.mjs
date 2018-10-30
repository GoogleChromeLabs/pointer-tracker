class Pointer {
    constructor(nativePointer) {
        /** Unique ID for this pointer */
        this.id = -1;
        this.nativePointer = nativePointer;
        this.pageX = nativePointer.pageX;
        this.pageY = nativePointer.pageY;
        this.clientX = nativePointer.clientX;
        this.clientY = nativePointer.clientY;
        if (self.Touch && nativePointer instanceof Touch) {
            this.id = nativePointer.identifier;
        }
        else if (isPointerEvent(nativePointer)) { // is PointerEvent
            this.id = nativePointer.pointerId;
        }
    }
    /**
     * Returns an expanded set of Pointers for high-resolution inputs.
     */
    getCoalesced() {
        if ('getCoalescedEvents' in this.nativePointer) {
            return this.nativePointer.getCoalescedEvents().map(p => new Pointer(p));
        }
        return [this];
    }
}
const isPointerEvent = (event) => self.PointerEvent && event instanceof PointerEvent;
const noop = () => { };
/**
 * Track pointers across a particular element
 */
class PointerTracker {
    /**
     * Track pointers across a particular element
     *
     * @param element Element to monitor.
     * @param callbacks
     */
    constructor(_element, callbacks) {
        this._element = _element;
        /**
         * State of the tracked pointers when they were pressed/touched.
         */
        this.startPointers = [];
        /**
         * Latest state of the tracked pointers. Contains the same number
         * of pointers, and in the same order as this.startPointers.
         */
        this.currentPointers = [];
        const { start = () => true, move = noop, end = noop, } = callbacks;
        this._startCallback = start;
        this._moveCallback = move;
        this._endCallback = end;
        // Bind methods
        this._pointerStart = this._pointerStart.bind(this);
        this._touchStart = this._touchStart.bind(this);
        this._move = this._move.bind(this);
        this._triggerPointerEnd = this._triggerPointerEnd.bind(this);
        this._pointerEnd = this._pointerEnd.bind(this);
        this._touchEnd = this._touchEnd.bind(this);
        // Add listeners
        if (self.PointerEvent) {
            this._element.addEventListener('pointerdown', this._pointerStart);
        }
        else {
            this._element.addEventListener('mousedown', this._pointerStart);
            this._element.addEventListener('touchstart', this._touchStart);
            this._element.addEventListener('touchmove', this._move);
            this._element.addEventListener('touchend', this._touchEnd);
        }
    }
    /**
     * Call the start callback for this pointer, and track it if the user wants.
     *
     * @param pointer Pointer
     * @param event Related event
     * @returns Whether the pointer is being tracked.
     */
    _triggerPointerStart(pointer, event) {
        if (!this._startCallback(pointer, event))
            return false;
        this.currentPointers.push(pointer);
        this.startPointers.push(pointer);
        return true;
    }
    /**
     * Listener for mouse/pointer starts. Bound to the class in the constructor.
     *
     * @param event This will only be a MouseEvent if the browser doesn't support
     * pointer events.
     */
    _pointerStart(event) {
        if (event.button !== 0 /* Left */)
            return;
        if (!this._triggerPointerStart(new Pointer(event), event))
            return;
        // Add listeners for additional events.
        // The listeners may already exist, but no harm in adding them again.
        if (isPointerEvent(event)) {
            this._element.setPointerCapture(event.pointerId);
            this._element.addEventListener('pointermove', this._move);
            this._element.addEventListener('pointerup', this._pointerEnd);
        }
        else { // MouseEvent
            window.addEventListener('mousemove', this._move);
            window.addEventListener('mouseup', this._pointerEnd);
        }
    }
    /**
     * Listener for touchstart. Bound to the class in the constructor.
     * Only used if the browser doesn't support pointer events.
     */
    _touchStart(event) {
        for (const touch of Array.from(event.changedTouches)) {
            this._triggerPointerStart(new Pointer(touch), event);
        }
    }
    /**
     * Listener for pointer/mouse/touch move events.
     * Bound to the class in the constructor.
     */
    _move(event) {
        const previousPointers = this.currentPointers.slice();
        const changedPointers = ('changedTouches' in event) ? // Shortcut for 'is touch event'.
            Array.from(event.changedTouches).map(t => new Pointer(t)) :
            [new Pointer(event)];
        const trackedChangedPointers = [];
        for (const pointer of changedPointers) {
            const index = this.currentPointers.findIndex(p => p.id === pointer.id);
            if (index === -1)
                continue; // Not a pointer we're tracking
            trackedChangedPointers.push(pointer);
            this.currentPointers[index] = pointer;
        }
        if (trackedChangedPointers.length === 0)
            return;
        this._moveCallback(previousPointers, trackedChangedPointers, event);
    }
    /**
     * Call the end callback for this pointer.
     *
     * @param pointer Pointer
     * @param event Related event
     */
    _triggerPointerEnd(pointer, event) {
        const index = this.currentPointers.findIndex(p => p.id === pointer.id);
        // Not a pointer we're interested in?
        if (index === -1)
            return false;
        this.currentPointers.splice(index, 1);
        this.startPointers.splice(index, 1);
        this._endCallback(pointer, event);
        return true;
    }
    /**
     * Listener for mouse/pointer ends. Bound to the class in the constructor.
     * @param event This will only be a MouseEvent if the browser doesn't support
     * pointer events.
     */
    _pointerEnd(event) {
        if (!this._triggerPointerEnd(new Pointer(event), event))
            return;
        if (isPointerEvent(event)) {
            if (this.currentPointers.length)
                return;
            this._element.removeEventListener('pointermove', this._move);
            this._element.removeEventListener('pointerup', this._pointerEnd);
        }
        else { // MouseEvent
            window.removeEventListener('mousemove', this._move);
            window.removeEventListener('mouseup', this._pointerEnd);
        }
    }
    /**
     * Listener for touchend. Bound to the class in the constructor.
     * Only used if the browser doesn't support pointer events.
     */
    _touchEnd(event) {
        for (const touch of Array.from(event.changedTouches)) {
            this._triggerPointerEnd(new Pointer(touch), event);
        }
    }
}

export default PointerTracker;
