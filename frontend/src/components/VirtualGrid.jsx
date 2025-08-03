import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';

const VirtualGrid = React.memo(({ 
  items = [], 
  itemHeight = 350, 
  itemWidth = 300, 
  containerHeight = 600,
  renderItem,
  gap = 16
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate how many items can fit per row
  const itemsPerRow = useMemo(() => {
    if (containerWidth === 0) return 1;
    return Math.floor((containerWidth + gap) / (itemWidth + gap));
  }, [containerWidth, itemWidth, gap]);

  // Calculate total rows needed
  const totalRows = useMemo(() => {
    return Math.ceil(items.length / itemsPerRow);
  }, [items.length, itemsPerRow]);

  // Calculate which rows are visible
  const visibleRows = useMemo(() => {
    const overscan = 2; // Render extra rows for smooth scrolling
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startRow, endRow };
  }, [scrollTop, containerHeight, itemHeight, totalRows]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startRow, endRow } = visibleRows;
    const items_to_render = [];
    
    for (let rowIndex = startRow; rowIndex < endRow; rowIndex++) {
      for (let colIndex = 0; colIndex < itemsPerRow; colIndex++) {
        const itemIndex = rowIndex * itemsPerRow + colIndex;
        if (itemIndex < items.length) {
          items_to_render.push({
            item: items[itemIndex],
            index: itemIndex,
            rowIndex,
            colIndex,
            top: rowIndex * itemHeight,
            left: colIndex * (itemWidth + gap)
          });
        }
      }
    }
    
    return items_to_render;
  }, [items, visibleRows, itemsPerRow, itemHeight, itemWidth, gap]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const handleResize = useCallback((entries) => {
    if (entries[0]) {
      setContainerWidth(entries[0].contentRect.width);
    }
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(handleResize);
    const container = document.getElementById('virtual-grid-container');
    if (container) {
      observer.observe(container);
      setContainerWidth(container.clientWidth);
    }
    
    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [handleResize]);

  const totalHeight = totalRows * itemHeight;

  return (
    <Box
      id="virtual-grid-container"
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative',
          width: '100%'
        }}
      >
        {visibleItems.map(({ item, index, top, left }) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top,
              left,
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

VirtualGrid.displayName = 'VirtualGrid';

export default VirtualGrid;