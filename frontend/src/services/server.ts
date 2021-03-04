import socketIO from 'socket.io-client';

const server = socketIO('http://localhost:4743');

export { server };