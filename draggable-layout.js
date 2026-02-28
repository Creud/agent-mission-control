// Draggable grid layout for office view
class DraggableLayout {
  constructor() {
    this.widgets = new Map();
    this.draggedElement = null;
    this.loadLayout();
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

  register(id, element) {
    const layout = this.loadLayout();
    const pos = layout[id] || { x: 0, y: 0, w: 100, h: 25 };
    
    element.style.position = 'absolute';
    element.style.left = pos.x + '%';
    element.style.top = pos.y + '%';
    element.style.width = pos.w + '%';
    element.style.height = pos.h + '%';
    
    const handle = this.createDragHandle(element);
    element.insertBefore(handle, element.firstChild);
    
    this.widgets.set(id, { el: element, handle });
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
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(element.style.left) || 0;
      startTop = parseFloat(element.style.top) || 0;
      element.style.zIndex = 1000;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = ((e.clientX - startX) / window.innerWidth) * 100;
      const dy = ((e.clientY - startY) / window.innerHeight) * 100;
      element.style.left = Math.max(0, Math.min(100 - parseFloat(element.style.width), startLeft + dx)) + '%';
      element.style.top = Math.max(0, Math.min(100 - parseFloat(element.style.height), startTop + dy)) + '%';
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        element.style.zIndex = '';
        this.saveLayout();
      }
    });
    
    return handle;
  }
}

const officeLayout = new DraggableLayout();
