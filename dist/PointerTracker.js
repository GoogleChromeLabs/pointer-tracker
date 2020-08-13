(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.PointerTracker = factory());
}(this, (function () { 'use strict';

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
            else if (isPointerEvent(nativePointer)) {
                // is PointerEvent
                this.id = nativePointer.pointerId;
            }
        }
        /**
         * Returns an expanded set of Pointers for high-resolution inputs.
         */
        getCoalesced() {
            if ('getCoalescedEvents' in this.nativePointer) {
                return this.nativePointer.getCoalescedEvents().map((p) => new Pointer(p));
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
         * @param options
         */
        constructor(_element, { start = () => true, move = noop, end = noop, rawUpdates = false, } = {}) {
            this._element = _element;
            /**
             * State of the tracked pointers when they were pressed/touched.
             */
            this.startPointers = [];
            /**
             * Latest state of the tracked pointers. Contains the same number of pointers, and in the same
             * order as this.startPointers.
             */
            this.currentPointers = [];
            /**
             * Listener for mouse/pointer starts.
             *
             * @param event This will only be a MouseEvent if the browser doesn't support pointer events.
             */
            this._pointerStart = (event) => {
                if (event.button !== 0 /* Left */)
                    return;
                if (!this._triggerPointerStart(new Pointer(event), event))
                    return;
                // Add listeners for additional events.
                // The listeners may already exist, but no harm in adding them again.
                if (isPointerEvent(event)) {
                    const capturingElement = event.target && 'setPointerCapture' in event.target
                        ? event.target
                        : this._element;
                    capturingElement.setPointerCapture(event.pointerId);
                    this._element.addEventListener(this._rawUpdates ? 'pointerrawupdate' : 'pointermove', this._move);
                    this._element.addEventListener('pointerup', this._pointerEnd);
                    this._element.addEventListener('pointercancel', this._pointerEnd);
                }
                else {
                    // MouseEvent
                    window.addEventListener('mousemove', this._move);
                    window.addEventListener('mouseup', this._pointerEnd);
                }
            };
            /**
             * Listener for touchstart.
             * Only used if the browser doesn't support pointer events.
             */
            this._touchStart = (event) => {
                for (const touch of Array.from(event.changedTouches)) {
                    this._triggerPointerStart(new Pointer(touch), event);
                }
            };
            /**
             * Listener for pointer/mouse/touch move events.
             */
            this._move = (event) => {
                const previousPointers = this.currentPointers.slice();
                const changedPointers = 'changedTouches' in event // Shortcut for 'is touch event'.
                    ? Array.from(event.changedTouches).map((t) => new Pointer(t))
                    : [new Pointer(event)];
                const trackedChangedPointers = [];
                for (const pointer of changedPointers) {
                    const index = this.currentPointers.findIndex((p) => p.id === pointer.id);
                    if (index === -1)
                        continue; // Not a pointer we're tracking
                    trackedChangedPointers.push(pointer);
                    this.currentPointers[index] = pointer;
                }
                if (trackedChangedPointers.length === 0)
                    return;
                this._moveCallback(previousPointers, trackedChangedPointers, event);
            };
            /**
             * Call the end callback for this pointer.
             *
             * @param pointer Pointer
             * @param event Related event
             */
            this._triggerPointerEnd = (pointer, event) => {
                const index = this.currentPointers.findIndex((p) => p.id === pointer.id);
                // Not a pointer we're interested in?
                if (index === -1)
                    return false;
                this.currentPointers.splice(index, 1);
                this.startPointers.splice(index, 1);
                const cancelled = event.type === 'touchcancel' || event.type === 'pointercancel';
                this._endCallback(pointer, event, cancelled);
                return true;
            };
            /**
             * Listener for mouse/pointer ends.
             *
             * @param event This will only be a MouseEvent if the browser doesn't support pointer events.
             */
            this._pointerEnd = (event) => {
                if (!this._triggerPointerEnd(new Pointer(event), event))
                    return;
                if (isPointerEvent(event)) {
                    if (this.currentPointers.length)
                        return;
                    this._element.removeEventListener(this._rawUpdates ? 'pointerrawupdate' : 'pointermove', this._move);
                    this._element.removeEventListener('pointerup', this._pointerEnd);
                    this._element.removeEventListener('pointercancel', this._pointerEnd);
                }
                else {
                    // MouseEvent
                    window.removeEventListener('mousemove', this._move);
                    window.removeEventListener('mouseup', this._pointerEnd);
                }
            };
            /**
             * Listener for touchend.
             * Only used if the browser doesn't support pointer events.
             */
            this._touchEnd = (event) => {
                for (const touch of Array.from(event.changedTouches)) {
                    this._triggerPointerEnd(new Pointer(touch), event);
                }
            };
            this._startCallback = start;
            this._moveCallback = move;
            this._endCallback = end;
            this._rawUpdates = rawUpdates && 'onpointerrawupdate' in window;
            // Add listeners
            if (self.PointerEvent) {
                this._element.addEventListener('pointerdown', this._pointerStart);
            }
            else {
                this._element.addEventListener('mousedown', this._pointerStart);
                this._element.addEventListener('touchstart', this._touchStart);
                this._element.addEventListener('touchmove', this._move);
                this._element.addEventListener('touchend', this._touchEnd);
                this._element.addEventListener('touchcancel', this._touchEnd);
            }
        }
        /**
         * Remove all listeners.
         */
        stop() {
            this._element.removeEventListener('pointerdown', this._pointerStart);
            this._element.removeEventListener('mousedown', this._pointerStart);
            this._element.removeEventListener('touchstart', this._touchStart);
            this._element.removeEventListener('touchmove', this._move);
            this._element.removeEventListener('touchend', this._touchEnd);
            this._element.removeEventListener('touchcancel', this._touchEnd);
            this._element.removeEventListener(this._rawUpdates ? 'pointerrawupdate' : 'pointermove', this._move);
            this._element.removeEventListener('pointerup', this._pointerEnd);
            this._element.removeEventListener('pointercancel', this._pointerEnd);
            window.removeEventListener('mousemove', this._move);
            window.removeEventListener('mouseup', this._pointerEnd);
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
    }

    return PointerTracker;

})));
