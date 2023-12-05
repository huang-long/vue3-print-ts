import type { SupportedElement, SupportedElementTagName, SupportedElementTagNameMap } from "./types";
export declare function isTagName<T extends SupportedElementTagName>(el: SupportedElement, tagNames: T[]): el is SupportedElementTagNameMap[T];
