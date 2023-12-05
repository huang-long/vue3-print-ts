import type { StyleInfo, SupportedElement } from "./types";
export declare function getDefaultStyleInfo(source: SupportedElement, pseudoSelector?: string): StyleInfo;
export declare function getStyleInfo(source: SupportedElement, pseudoSelector?: string): StyleInfo;
export declare function patchStyle(target: SupportedElement, styleInfo: StyleInfo, defaultStyleInfo: StyleInfo): void;
