class CollaborativeWhiteboard {
    constructor() {
        this.canvas = document.getElementById('whiteboard');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.brushSize = 3;
        this.isEraser = false;
        
        this.initCanvas();
        this.initWebSocket();
        this.initEventListeners();
    }

    initCanvas() {
        // Set canvas size to full container
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Set default canvas properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.showStatus('Connected', 'success');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'userCount') {
                this.updateUserCount(data.count);
            } else if (data.type === 'draw') {
                this.drawFromRemote(data);
            } else if (data.type === 'clear') {
                this.clearCanvas();
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.showStatus('Disconnected - Reconnecting...', 'error');
            setTimeout(() => this.initWebSocket(), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    initEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Tool controls
        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        const colorPicker = document.getElementById('colorPicker');
        const eraserBtn = document.getElementById('eraserBtn');
        const clearBtn = document.getElementById('clearBtn');

        brushSize.addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            brushSizeValue.textContent = `${e.target.value}px`;
        });

        colorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.isEraser = false;
            eraserBtn.textContent = '🧹 Eraser';
            eraserBtn.style.background = 'var(--primary)';
        });

        eraserBtn.addEventListener('click', () => {
            this.isEraser = !this.isEraser;
            if (this.isEraser) {
                eraserBtn.textContent = '✏️ Draw';
                eraserBtn.style.background = 'var(--success)';
            } else {
                eraserBtn.textContent = '🧹 Eraser';
                eraserBtn.style.background = 'var(--primary)';
            }
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Clear the entire whiteboard for everyone?')) {
                this.clearCanvas();
                this.sendClearMessage();
            }
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width * this.canvas.width,
            y: (e.clientY - rect.top) / rect.height * this.canvas.height
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    draw(e) {
        if (!this.isDrawing) return;

        const pos = this.getMousePos(e);
        
        this.drawLine(this.lastX, this.lastY, pos.x, pos.y, 
                     this.isEraser ? '#0f0f0f' : this.currentColor, 
                     this.brushSize);

        // Send draw data to other clients
        this.sendDrawData({
            type: 'draw',
            x1: this.lastX / this.canvas.width,
            y1: this.lastY / this.canvas.height,
            x2: pos.x / this.canvas.width,
            y2: pos.y / this.canvas.height,
            color: this.isEraser ? '#0f0f0f' : this.currentColor,
            size: this.brushSize
        });

        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    drawLine(x1, y1, x2, y2, color, size) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = size;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    drawFromRemote(data) {
        const x1 = data.x1 * this.canvas.width;
        const y1 = data.y1 * this.canvas.height;
        const x2 = data.x2 * this.canvas.width;
        const y2 = data.y2 * this.canvas.height;
        
        this.drawLine(x1, y1, x2, y2, data.color, data.size);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    sendDrawData(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    sendClearMessage() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'clear' }));
        }
    }

    updateUserCount(count) {
        document.getElementById('userCount').textContent = 
            `${count} user${count !== 1 ? 's' : ''}`;
    }

    showStatus(message, type) {
        const status = document.getElementById('connectionStatus');
        status.textContent = message;
        status.className = `connection-status show ${type}`;
        
        setTimeout(() => {
            status.classList.remove('show');
        }, 3000);
    }
}

// Initialize the whiteboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CollaborativeWhiteboard();
});
