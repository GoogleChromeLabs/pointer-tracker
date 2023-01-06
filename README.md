# PointerTracker

Track mouse/touch/pointer events for a given element.

## API

### PointerTracker

```js
import PointerTracker from '@douganderson444/pointer-tracker';

const pointerTracker = new PointerTracker(element, {
  start(pointer, event) {
    // Called when a pointer is pressed/touched within the element.
    //
    // pointer - The new pointer. This pointer isn't included in this.currentPointers or
    // this.startPointers yet.
    //
    // event - The event related to this pointer.
    //
    // Return true from this callback if you're interested in further events about this pointer,
    // such as 'move' and 'end'.
  },
  move(previousPointers, changedPointers, event) {
    // Called when pointers have moved.
    //
    // previousPointers - The state of the pointers before this event. This contains the same number
    // of pointers, in the same order, as this.currentPointers and this.startPointers.
    //
    // changedPointers - The pointers that have changed since the last move callback.
    //
    // event - The event related to the pointer changes.
  },
  end(pointer, event, cancelled) {
    // Called when a pointer is released.
    //
    // pointer - The final state of the pointer that ended. This pointer is now absent from
    // this.currentPointers and this.startPointers.
    //
    // event - The event related to this pointer.
    //
    // cancelled - True if the event was cancelled. Actions are cancelled when the OS takes over
    // pointer events, for actions such as scrolling.
  },
  // Avoid pointer events in favour of touch and mouse events?
  //
  // Even if the browser supports pointer events, you may want to force the browser to use
  // mouse/touch fallbacks, to work around bugs such as
  // https://bugs.webkit.org/show_bug.cgi?id=220196.
  //
  // The default is false.
  avoidPointerEvents: false,
  // Use raw pointer updates? Pointer events are usually synchronised to requestAnimationFrame.
  // However, if you're targeting a desynchronised canvas, then faster 'raw' updates are better.
  //
  // This feature only applies to pointer events. The default is false.
  rawUpdates: false,
  // Set the event listener options
  // For example, set { capture: true } if you want to capture the event before it reaches listeners
  // below yours in the DOM tree.
  // For details, see: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters
  eventListenerOptions: { capture?: false, passive?: false, once?: false },
});

// State of the tracked pointers when they were pressed/touched.
pointerTracker.startPointers;
// Latest state of the tracked pointers. Contains the same number of pointers, and in the same order
// as this.startPointers.
pointerTracker.currentPointers;
// Remove all listeners. Call this when you're done tracking.
pointerTracker.stop();
```

### Pointer

```js
const pointer = pointerTracker.currentPointers[0];

// x offset from the top of the document
pointer.pageX;
// y offset from the top of the document
pointer.pageY;
// x offset from the top of the viewport
pointer.clientX;
// y offset from the top of the viewport
pointer.clientY;
// Unique ID for this pointer
pointer.id;
// The platform object used to create this Pointer
pointer.nativePointer;
// Returns an expanded set of Pointers for high-resolution inputs.
const pointers = pointer.getCoalesced();
```

## Demo

[A simple painting app](https://pointer-tracker-demo.glitch.me/) ([code](https://glitch.com/edit/#!/pointer-tracker-demo?path=public/index.html)).

## Files

- `lib/index.ts` - Original TypeScript.
- `dist/PointerTracker.mjs` - JS module. Default exports PointerTracker.
- `dist/PointerTracker.js` - UMD JS. Exposes PointerTracker on the global by default.
- `dist/PointerTracker-min.js` - Minified UMD JS. ~900 bytes brotli'd.
