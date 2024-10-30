using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace RestrictedNL.Models;

class SocketsRepository
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new();

    public void AddSocket(string id, WebSocket socket)
    {
        _sockets.TryAdd(id, socket);
    }

    public WebSocket GetSocket(string id)
    {
        return _sockets[id];
    }

    public void RemoveSocket(string id)
    {
        _sockets.TryRemove(id, out _);
    }
}