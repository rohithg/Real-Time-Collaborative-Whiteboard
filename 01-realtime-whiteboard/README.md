# Real-Time Collaborative Whiteboard

A production-grade collaborative whiteboard application showcasing WebSocket real-time communication and HTML5 Canvas API.

## 🎯 Key Features Demonstrated

- **WebSocket Communication**: Real-time bidirectional data synchronization
- **Canvas API**: Advanced drawing capabilities with smooth rendering
- **Event Handling**: Mouse and touch event management
- **State Management**: Coordinated drawing state across multiple clients
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technologies Used

- **Backend**: Node.js, Express, WebSocket (ws library)
- **Frontend**: Vanilla JavaScript, HTML5 Canvas API, CSS3
- **Real-time**: WebSocket protocol for instant updates

## 📦 Installation

```bash
npm install
```

## 🚀 Running the Application

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 💡 Features

- **Multi-user Collaboration**: Multiple users can draw simultaneously
- **Drawing Tools**: Adjustable brush size and color picker
- **Eraser Mode**: Toggle between draw and erase
- **Clear Canvas**: Reset the entire board for all users
- **User Counter**: Live count of connected users
- **Connection Status**: Visual feedback for WebSocket connection

## 🏗️ Architecture

### Backend
- Express server handles HTTP requests
- WebSocket server manages real-time connections
- Broadcasting system distributes drawing data to all clients

### Frontend
- Canvas API for drawing operations
- WebSocket client for real-time communication
- Normalized coordinates for resolution-independent drawing
- Touch event support for mobile devices

## 🎨 Technical Highlights

1. **Normalized Coordinates**: Drawing positions are normalized (0-1) for consistency across different screen sizes
2. **Performance Optimization**: Efficient canvas rendering with minimal redraws
3. **Error Handling**: Automatic reconnection on WebSocket failure
4. **Cross-browser Compatibility**: Works on all modern browsers

## 📝 Use Cases

- Remote team brainstorming
- Online tutoring and teaching
- Design collaboration
- Game development

## 🔧 Customization

Modify `server.js` to:
- Change the default port
- Add authentication
- Implement drawing persistence
- Add rooms/channels

## 📄 License

MIT
