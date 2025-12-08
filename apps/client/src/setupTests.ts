import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from "util"

import "@testing-library/jest-dom"

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = NodeTextEncoder
}

if (typeof globalThis.TextDecoder === "undefined") {
  // @ts-expect-error: Node TextDecoder is compatible for Jest environment
  globalThis.TextDecoder = NodeTextDecoder
}
