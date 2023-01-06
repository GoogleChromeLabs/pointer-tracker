declare class Pointer {
    /** x offset from the top of the document */
    pageX: number;
    /** y offset from the top of the document */
    pageY: number;
    /** x offset from the top of the viewport */
    clientX: number;
    /** y offset from the top of the viewport */
    clientY: number;
    /** Unique ID for this pointer */
    id: number;
    /** The platform object used to create this Pointer */
    nativePointer: Touch | PointerEvent | MouseEvent;
    constructor(nativePointer: Touch | PointerEvent | MouseEvent);
    /**
     * Returns an expanded set of Pointers for high-resolution inputs.
     */
    getCoalesced(): Pointer[];
}
declare type PointerType = Pointer;
export { PointerType as Pointer };
export declare type InputEvent = TouchEvent | PointerEvent | MouseEvent;
declare type StartCallback = (pointer: Pointer, event: InputEvent) => boolean;
declare type MoveCallback = (previousPointers: Pointer[], changedPointers: Pointer[], event: InputEvent) => void;
declare type EndCallback = (pointer: Pointer, event: InputEvent, cancelled: boolean) => void;
declare type eventListenerOptions = {
    capture?: boolean;
    passive?: boolean;
    once?: boolean;
};
interface PointerTrackerOptions {
    /**
     * Called when a pointer is pressed/touched within the element.
     *
     * @param pointer The new pointer. This pointer isn't included in this.currentPointers or
     * this.startPointers yet.
     * @param event The event related to this pointer.
     *
     * @returns Whether you want to track this pointer as it moves.
     */
    start?: StartCallback;
    /**
     * Called when pointers have moved.
     *
     * @param previousPointers The state of the pointers before this event. This contains the same
     * number of pointers, in the same order, as this.currentPointers and this.startPointers.
     * @param changedPointers The pointers that have changed since the last move callback.
     * @param event The event related to the pointer changes.
     */
    move?: MoveCallback;
    /**
     * Called when a pointer is released.
     *
     * @param pointer The final state of the pointer that ended. This pointer is now absent from
     * this.currentPointers and this.startPointers.
     * @param event The event related to this pointer.
     * @param cancelled Was the action cancelled? Actions are cancelled when the OS takes over pointer
     * events, for actions such as scrolling.
     */
    end?: EndCallback;
    /**
     * Avoid pointer events in favour of touch and mouse events?
     *
     * Even if the browser supports pointer events, you may want to force the browser to use
     * mouse/touch fallbacks, to work around bugs such as
     * https://bugs.webkit.org/show_bug.cgi?id=220196.
     */
    avoidPointerEvents?: boolean;
    /**
     * Use raw pointer updates? Pointer events are usually synchronised to requestAnimationFrame.
     * However, if you're targeting a desynchronised canvas, then faster 'raw' updates are better.
     *
     * This feature only applies to pointer events.
     */
    rawUpdates?: boolean;
    /**
     * Set the options of the event listener: capture, passive, and once.
     * See: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters
     */
    eventListenerOptions?: eventListenerOptions;
}
/**
 * Track pointers across a particular element
 */
export default class PointerTracker {
    private _element;
    /**
     * State of the tracked pointers when they were pressed/touched.
     */
    readonly startPointers: Pointer[];
    /**
     * Latest state of the tracked pointers. Contains the same number of pointers, and in the same
     * order as this.startPointers.
     */
    readonly currentPointers: Pointer[];
    private _startCallback;
    private _moveCallback;
    private _endCallback;
    private _rawUpdates;
    private _eventListenerOptions;
    /**
     * Firefox has a bug where touch-based pointer events have a `buttons` of 0, when this shouldn't
     * happen. https://bugzilla.mozilla.org/show_bug.cgi?id=1729440
     *
     * Usually we treat `buttons === 0` as no-longer-pressed. This set allows us to exclude these
     * buggy Firefox events.
     */
    private _excludeFromButtonsCheck;
    /**
     * Track pointers across a particular element
     *
     * @param element Element to monitor.
     * @param options
     */
    constructor(_element: HTMLElement, { start, move, end, rawUpdates, avoidPointerEvents, eventListenerOptions, }?: PointerTrackerOptions);
    /**
     * Remove all listeners.
     */
    stop(): void;
    /**
     * Call the start callback for this pointer, and track it if the user wants.
     *
     * @param pointer Pointer
     * @param event Related event
     * @returns Whether the pointer is being tracked.
     */
    private _triggerPointerStart;
    /**
     * Listener for mouse/pointer starts.
     *
     * @param event This will only be a MouseEvent if the browser doesn't support pointer events.
     */
    private _pointerStart;
    /**
     * Listener for touchstart.
     * Only used if the browser doesn't support pointer events.
     */
    private _touchStart;
    /**
     * Listener for pointer/mouse/touch move events.
     */
    private _move;
    /**
     * Call the end callback for this pointer.
     *
     * @param pointer Pointer
     * @param event Related event
     */
    private _triggerPointerEnd;
    /**
     * Listener for mouse/pointer ends.
     *
     * @param event This will only be a MouseEvent if the browser doesn't support pointer events.
     */
    private _pointerEnd;
    /**
     * Listener for touchend.
     * Only used if the browser doesn't support pointer events.
     */
    private _touchEnd;
}
