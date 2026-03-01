// Draggable grid layout for office view with snap-to-grid
class DraggableLayout {
  constructor() {
    this.widgets = new Map();
    this.draggedElement = null;
    this.snapGrid = 5; // snap every 5%
    this.loadLayout();
  }

  snap(value) {
    return Math.round(value / this.snapGrid) * this.snapGrid;
  }

  loadLayout() {
    try {
      const saved = localStorage.getItem('office-layout');
      return saved ? JSON.parse(saved) : this.getDefaultLayout();
    } catch(e) {
      return this.getDefaultLayout();
    }
  }

  getDefaultLayout() {
    return {
      news: { x: 0, y: 0, w: 100, h: 25 },
      office: { x: 0, y: 25, w: 100, h: 75 }
    };
  }

  saveLayout() {
    const layout = {};
    this.widgets.forEach((data, id) => {
      layout[id] = {
        x: parseFloat(data.el.style.left) || 0,
        y: parseFloat(data.el.style.top) || 0,
        w: parseFloat(data.el.style.width) || 100,
        h: parseFloat(data.el.style.height) || 25
      };
    });
    localStorage.setItem('office-layout', JSON.stringify(layout));
  }

  register(id, element, dragHeaderSelector = null) {
    const layout = this.loadLayout();
    const pos = layout[id] || { x: 0, y: 0, w: 100, h: 25 };
    
    element.style.position = 'absolute';
    element.style.left = pos.x + '%';
    element.style.top = pos.y + '%';
    element.style.width = pos.w + '%';
    element.style.height = pos.h + '%';
    
    const dragArea = dragHeaderSelector 
      ? element.querySelector(dragHeaderSelector) 
      : this.createDragHandle(element);
    
    if (!dragHeaderSelector) {
      element.insertBefore(dragArea, element.firstChild);
    } else {
      dragArea.style.cursor = 'move';
    }
    
    this.makeDraggable(element, dragArea);
    this.widgets.set(id, { el: element, dragArea });
  }

  createDragHandle(element) {
    const handle = document.createElement('div');
    handle.className = 'drag-handle';
    handle.innerHTML = '⋮⋮';
    handle.style.cssText = `
      position: absolute;
      top: 4px;
      right: 4px;
      cursor: move;
      font-size: 1rem;
      color: var(--text3);
      padding: 4px 8px;
      user-select: none;
      z-index: 100;
    `;
    return handle;
  }

  makeDraggable(element, dragArea) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    dragArea.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(element.style.left) || 0;
      startTop = parseFloat(element.style.top) || 0;
      element.style.zIndex = 1000;
      element.classList.add("dragging");
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = ((e.clientX - startX) / window.innerWidth) * 100;
      const dy = ((e.clientY - startY) / window.innerHeight) * 100;
      let newLeft = startLeft + dx;
      let newTop = startTop + dy;
      
      // Clamp to viewport
      newLeft = Math.max(0, Math.min(100 - parseFloat(element.style.width), newLeft));
      newTop = Math.max(0, Math.min(100 - parseFloat(element.style.height), newTop));
      
      element.style.left = newLeft + '%';
      element.style.top = newTop + '%';
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // Snap to grid
        const left = parseFloat(element.style.left);
        const top = parseFloat(element.style.top);
        element.style.left = this.snap(left) + '%';
        element.style.top = this.snap(top) + '%';
        element.style.zIndex = '';
        element.classList.remove('dragging');
        this.saveLayout();
      }
    });
  }
}

const officeLayout = new DraggableLayout();
