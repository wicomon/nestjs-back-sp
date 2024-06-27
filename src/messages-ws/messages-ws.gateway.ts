import { MessagesWsService } from './messages-ws.service';
import { Socket, Server } from 'socket.io';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    // console.log('client', client.id)
    const token = client.handshake.headers.authentication as string;
    // console.log({token})
    let payload: JwtPayload;

    try {
       payload = this.jwtService.verify( token );
       await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({payload})

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());

    // console.log({conectados: this.messagesWsService.getConnectedClients()})
  }

  handleDisconnect(client: Socket, ...args: any[]) {
    // console.log('client', client.id)
    this.messagesWsService.removeClient(client.id);
  }


  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto){
    console.log(client.id, payload)

    //! Solo notificar al que envio
    // client.emit('message-from-server', {
    //   fullName: 'its me',
    //   message: payload.message || 'no-message!!'
    // })

    //! emitir a todos menos al que lo envio
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'its me',
    //   message: payload.message || 'no-message!!'
    // })

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!'
    })
  }
}
