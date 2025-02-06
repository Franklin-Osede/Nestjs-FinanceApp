export function sanitizeString(str) {
    const sanitized = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, function (char) {
        return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
    });
    return sanitized;
}