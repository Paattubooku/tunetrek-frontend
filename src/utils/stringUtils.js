export const decodeHtmlEntities = (str) => {
    if (!str) return '';
    return str.replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'");
};
