// src/components/shared/VirtualizedList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  estimatedItemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export default function VirtualizedList<T>({
  items,
  estimatedItemHeight,
  renderItem,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ overflow: 'auto', height: '600px' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              width: '100%',
            }}
          >
            {renderItem(items[virtualItem.index]!, virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}