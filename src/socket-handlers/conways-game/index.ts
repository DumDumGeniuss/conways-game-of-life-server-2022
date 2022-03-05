import { Socket } from 'socket.io';
import { ConwaysGame, CleanBoard } from '../../libs/conways-game';
import { ConwaysGameManager } from '../../libs/conways-game-manager';
import { validateToken, generateToken, User } from '../../utils/authenticate/';
import { generateHash, generateHexColor } from '../../utils/common/';

const conwaysGameManager = new ConwaysGameManager(new ConwaysGame(30), 2000);

export const conwaysGameAuthenticator = (socket: Socket, next: any) => {
  try {
    socket.data.user = validateToken(socket.handshake.auth.authorization);
    socket.data.token = socket.handshake.auth.authorization;
    next();
  } catch (e: any) {
    const newUser = {
      id: generateHash(),
      color: generateHexColor(),
    };
    socket.data.user = newUser;
    socket.data.token = generateToken(newUser);
    next();
  }
};

const emitLoggedEvent = (nop: Socket, user: User, token: string) => {
  nop.emit('logged', user, token);
};

const emitGameStartedEvent = (
  nop: Socket,
  conwaysGame: ConwaysGame,
  playerId: string
) => {
  nop.emit(
    'game_started',
    conwaysGame.getSize(),
    conwaysGame.getPlayer(playerId),
    conwaysGame.getPlayers(),
    conwaysGame.getBoard()
  );
};
const emitPlayerJoinedEvent = (
  nop: Socket,
  conwaysGame: ConwaysGame,
  playerId: string
) => {
  nop.broadcast.emit('player_joind', conwaysGame.getPlayer(playerId));
};

const subscribePlayerForBoardUpdatedEvent = (
  nop: Socket,
  conwaysGame: ConwaysGame,
  playerId: string
) => {
  conwaysGameManager.subscribe(
    conwaysGame.getPlayer(playerId),
    (board: CleanBoard) => {
      nop.emit('board_updated', board);
    }
  );
};

const handleReviveCellEvent = (
  nop: Socket,
  conwaysGame: ConwaysGame,
  playerId: string
) => {
  nop.on('revive_cell', (x: number, y: number) => {
    const cell = conwaysGame.reviveCell(x, y, playerId);
    if (!cell) {
      nop.emit('revive_cell_failed', x, y, conwaysGame.getCell(x, y));
    }
  });
};

const handleDisconnectEvent = (
  nop: Socket,
  conwaysGame: ConwaysGame,
  playerId: string
) => {
  // The player disconnects
  nop.on('disconnect', (reason) => {
    console.log(
      `Player with id of ${playerId} disconnected. Readon: ${reason}.`
    );
    conwaysGame.removePlayer(playerId);
    conwaysGameManager.unsubscribe(playerId);
  });
};

export const conwaysGameHandler = (nop: Socket) => {
  // Get the user data
  const player: User = nop.data.user;
  console.log(`Player with oid of ${player.id} connected.`);

  // Get the conways game object and add new player!
  const conwaysGame = conwaysGameManager.getGame();
  conwaysGame.addPlayer(player);
  emitLoggedEvent(nop, nop.data.user, nop.data.token);

  // Tell client that we're started
  emitGameStartedEvent(nop, conwaysGame, player.id);
  emitPlayerJoinedEvent(nop, conwaysGame, player.id);

  // Subscribe borad chagnes after evolving
  subscribePlayerForBoardUpdatedEvent(nop, conwaysGame, player.id);

  // Handle events from client
  handleReviveCellEvent(nop, conwaysGame, player.id);
  handleDisconnectEvent(nop, conwaysGame, player.id);
};

export {};
