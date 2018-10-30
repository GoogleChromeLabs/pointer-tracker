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
declare type EndCallback = (pointer: Pointer, event: InputEvent) => void;
interface PointerTrackerCallbacks {
    /**
     * Called when a pointer is pressed/touched within the element.
     *
     * @param pointer The new pointer.
     * This pointer isn't included in this.currentPointers or this.startPointers yet.
     * @param event The event related to this pointer.
     *
     * @returns Whether you want to track this pointer as it moves.
     */
    start?: StartCallback;
    /**
     * Called when pointers have moved.
     *
     * @param previousPointers The state of the pointers before this event.
     * This contains the same number of pointers, in the same order, as
     * this.currentPointers and this.startPointers.
     * @param changedPointers The pointers that have changed since the last move callback.
     * @param event The event related to the pointer changes.
     */
    move?: MoveCallback;
    /**
     * Called when a pointer is released.
     *
     * @param pointer The final state of the pointer that ended. This
     * pointer is now absent from this.currentPointers and
     * this.startPointers.
     * @param event The event related to this pointer.
     */
    end?: EndCallback;
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
     * Latest state of the tracked pointers. Contains the same number
     * of pointers, and in the same order as this.startPointers.
     */
    readonly currentPointers: Pointer[];
    private _startCallback;
    private _moveCallback;
    private _endCallback;
    /**
     * Track pointers across a particular element
     *
     * @param element Element to monitor.
     * @param callbacks
     */
    constructor(_element: HTMLElement, callbacks: PointerTrackerCallbacks);
    /**
     * Call the start callback for this pointer, and track it if the user wants.
     *
     * @param pointer Pointer
     * @param event Related event
     * @returns Whether the pointer is being tracked.
     */
    private _triggerPointerStart;
    /**
     * Listener for mouse/pointer starts. Bound to the class in the constructor.
     *
     * @param event This will only be a MouseEvent if the browser doesn't support
     * pointer events.
     */
    private _pointerStart;
    /**
     * Listener for touchstart. Bound to the class in the constructor.
     * Only used if the browser doesn't support pointer events.
     */
    private _touchStart;
    /**
     * Listener for pointer/mouse/touch move events.
     * Bound to the class in the constructor.
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
     * Listener for mouse/pointer ends. Bound to the class in the constructor.
     * @param event This will only be a MouseEvent if the browser doesn't support
     * pointer events.
     */
    private _pointerEnd;
    /**
     * Listener for touchend. Bound to the class in the constructor.
     * Only used if the browser doesn't support pointer events.
     */
    private _touchEnd;
}
