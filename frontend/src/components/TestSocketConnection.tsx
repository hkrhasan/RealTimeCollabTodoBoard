import { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

const TestSocketConnection = () => {
  const [latency, setLatency] = useState<number | null>(null);
  const { socket, isConnected } = useSocket();


  const testLatency = () => {
    if (!socket) return;

    const start = Date.now();
    socket.emit('ping', () => {
      const end = Date.now();
      setLatency(end - start);
    });
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '40px auto',
      textAlign: 'center'
    }}>
      <h2>Socket.IO Connection Test</h2>

      <div style={{
        margin: '20px 0',
        color: isConnected ? 'green' : 'red',
        fontWeight: 'bold'
      }}>
        Status: {isConnected ? 'CONNECTED ✅' : 'DISCONNECTED ❌'}
      </div>

      <div style={{ margin: '15px 0' }}>
        <button
          onClick={testLatency}
          style={{
            padding: '10px 15px',
            background: '#4361ee',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Latency
        </button>

        {latency && (
          <div style={{ marginTop: '10px' }}>
            Round-trip: <strong>{latency}ms</strong>
          </div>
        )}
      </div>


    </div>
  );
};

export default TestSocketConnection;