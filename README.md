# PointerTracker

Track mouse/touch/pointer events for a given element.

## API

### PointerTracker

```js
import PointerTracker from 'pointer-tracker';

const pointerTracker = new PointerTracker(element, {
  start(pointer, event) {
    // Called when a pointer is pressed/touched within the element.
    // pointer - The new pointer. This pointer isn't included in this.currentPointers or
    //    this.startPointers yet.
    // event - The event related to this pointer.
  },
  move(previousPointers, changedPointers, event) {
    // Called when pointers have moved.
    // previousPointers - The state of the pointers before this event. This contains the same number
    //   of pointers, in the same order, as this.currentPointers and this.startPointers.
    // changedPointers - The pointers that have changed since the last move callback.
    // event - The event related to the pointer changes.
  },
  end(pointer, event) {
    // Called when a pointer is released.
    // pointer - The final state of the pointer that ended. This pointer is now absent from
    //    this.currentPointers and this.startPointers.
    // event - The event related to this pointer.
  }
});

// State of the tracked pointers when they were pressed/touched.
pointerTracker.startPointers;
// Latest state of the tracked pointers. Contains the same number of pointers, and in the same order
// as this.startPointers.
pointerTracker.currentPointers;
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

* `lib/index.ts` - Original TypeScript.
* `dist/PointerTracker.mjs` - JS module. Default exports PointerTracker.
* `dist/PointerTracker.js` - Plain JS. Exposes PointerTracker on the global.
* `dist/PointerTracker-min.js` - Minified plain JS. ~800 bytes gzipped.
