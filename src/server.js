import Server from 'socket.io';
const PORT = 8090;

function emitState(receiver, store) {
  return receiver.emit('state', store.getState().toJS());
}

export default function startServer(store) {
  const io = new Server().attach(PORT);

  store.subscribe(
    () => emitState(io, store)
  );

  io.on('connection', (socket) => {
    emitState(socket, store);
    socket.on('action', store.dispatch.bind(store));
  });
}

