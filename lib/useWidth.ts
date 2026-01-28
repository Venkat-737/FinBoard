'use client';

import { useState, useEffect, useRef } from 'react';

export function useWidth() {
    const [width, setWidth] = useState(1200); // Default fallback
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect) {
                    setWidth(Math.floor(entries[0].contentRect.width));
                }
            }
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [container]);

    return { containerRef: setContainer, width };
}
