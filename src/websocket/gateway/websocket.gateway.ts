import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EnterRoomDto } from '../dto/enter-room.dto';
import { UserInfoDto } from '../dto/user-info.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private roomPresences = new Map<string, Map<string, UserInfoDto>>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('room:enter')
  async handleEnterRoom(client: Socket, payload: EnterRoomDto): Promise<void> {
    const { roomId, userInfo } = payload;

    await client.join(roomId);

    if (!this.roomPresences.has(roomId)) {
      this.roomPresences.set(roomId, new Map());
    }

    const room = this.roomPresences.get(roomId);
    room?.set(userInfo.userId, userInfo);
  }
}
