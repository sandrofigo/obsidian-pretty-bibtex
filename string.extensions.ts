import { StringHelper } from "StringHelper";

declare global {
    interface String {
        trimString(trim: string): string;
        replaceAll(str: string, replacement: string): string;
    }
}

String.prototype.trimString = function (trim: string) {
    return StringHelper.trim(String(this), trim);
};

String.prototype.replaceAll = function (str: string, replacement: string) {
    return String(this).replace(new RegExp(`\\${str}`, "gs"), replacement);
};

export { }