using System.Collections.Concurrent;
using System.Net.WebSockets;

namespace RestrictedNL.Models;

public class SocketsRepository
{
    private readonly ConcurrentDictionary<int, WebSocket> _sockets = new();

    public void AddSocket(int id, WebSocket socket)
    {
        _sockets.TryAdd(id, socket);
    }

    public WebSocket GetSocket(int id)
    {
        return _sockets[id];
    }

    public void RemoveSocket(int id)
    {
        _sockets.TryRemove(id, out _);
    }
}