export const getNestedValue = (obj: any, path: string): any => {
    if (!obj) return undefined;
    if (!path || path === '' || path === 'ROOT') return obj;

    // Check if the FULL path exists as a direct key first
    if (obj[path] !== undefined) return obj[path];

    // Nested lookup with "Look-Ahead" for keys containing dots
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
        if (current === undefined || current === null) return undefined;

        const part = parts[i];

        // Direct match
        if (current[part] !== undefined) {
            current = current[part];
            continue;
        }

        // Look-ahead: Checks if "part.nextPart" is the key (Handle "05. price" keys)
        if (i + 1 < parts.length) {
            const joined = part + '.' + parts[i + 1];
            if (current[joined] !== undefined) {
                current = current[joined];
                i++;
                continue;
            }
        }

        return undefined;
    }

    return current;
};

export const normalizeData = (data: any, adapterId: string, dataMap: any): any => {
    if (adapterId === 'alpha_vantage') {
        return data;
    }
    return data;
};
