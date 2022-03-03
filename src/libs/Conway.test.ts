import { Conway } from './Conway';

describe('Conway', () => {
  describe('construction', () => {
    it('Should init board on creation', () => {
      const c = new Conway(100);
      const expected = {
        live: false,
        liveNbrsCount: 0,
        playerIdsMap: {},
      };
      expect(c.getBoard()[99][99]).toEqual(expected);
    });
  });
  describe('addPlayer', () => {
    it('Should add player', () => {
      const c = new Conway(1);
      const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
      c.addPlayer(p);

      expect(c.getPlayersMap()[p.id]).toEqual(p);
    });
  });
  describe('removePlayer', () => {
    it('Should remove player', () => {
      const c = new Conway(1);
      const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
      c.addPlayer(p);
      c.removePlayer(p.id);

      expect(c.getPlayer(p.id)).toBeUndefined();
    });
  });
  describe('evolve', () => {
    describe('Revived cell', () => {
      it('Block Pattern', () => {
        const c = new Conway(3);
        const p1 = { id: '1', ip: '1.1.1.1', color: '#112233' };
        const p2 = { id: '2', ip: '1.1.1.1', color: '#112233' };
        const p3 = { id: '3', ip: '1.1.1.1', color: '#112233' };
        c.addPlayer(p1);
        c.addPlayer(p2);
        c.addPlayer(p3);
        c.makeCellAlive(0, 0, p1.id);
        c.makeCellAlive(0, 1, p2.id);
        c.makeCellAlive(0, 2, p3.id);
        c.evolve();
        expect(c.getCell(1, 1).playerIdsMap).toEqual({
          '1': true,
          '2': true,
          '3': true,
        });
      });
    });
    describe('Class patterns', () => {
      it('Block Pattern', () => {
        const c = new Conway(4);
        const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
        c.addPlayer(p);
        c.makeCellAlive(1, 1, p.id);
        c.makeCellAlive(1, 2, p.id);
        c.makeCellAlive(2, 1, p.id);
        c.makeCellAlive(2, 2, p.id);
        c.evolve();
        const secondGeneration = c.getLiveMap();
        const blockPattern = [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
        ];

        expect(secondGeneration).toEqual(blockPattern);
      });
      it('Boat Pattern', () => {
        const c = new Conway(5);
        const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
        c.addPlayer(p);
        c.makeCellAlive(1, 1, p.id);
        c.makeCellAlive(1, 2, p.id);
        c.makeCellAlive(2, 1, p.id);
        c.makeCellAlive(2, 3, p.id);
        c.makeCellAlive(3, 2, p.id);
        c.evolve();
        const secondGeneration = c.getLiveMap();
        const boatPattern = [
          [0, 0, 0, 0, 0],
          [0, 1, 1, 0, 0],
          [0, 1, 0, 1, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 0, 0],
        ];

        expect(secondGeneration).toEqual(boatPattern);
      });
      it('Blink Pattern', () => {
        const c = new Conway(5);
        const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
        c.addPlayer(p);
        c.makeCellAlive(1, 2, p.id);
        c.makeCellAlive(2, 2, p.id);
        c.makeCellAlive(3, 2, p.id);
        c.evolve();
        const secondGeneration = c.getLiveMap();
        const blinkPattern = [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
        ];

        expect(secondGeneration).toEqual(blinkPattern);
      });
      it('Glider Pattern', () => {
        const c = new Conway(5);
        const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
        c.addPlayer(p);
        c.makeCellAlive(1, 1, p.id);
        c.makeCellAlive(2, 2, p.id);
        c.makeCellAlive(2, 3, p.id);
        c.makeCellAlive(3, 1, p.id);
        c.makeCellAlive(3, 2, p.id);
        c.evolve();
        const secondGeneration = c.getLiveMap();
        c.evolve();
        const thirdGeneration = c.getLiveMap();
        const gliderPatternOne = [
          [0, 0, 0, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
        ];
        const gliderPatternTwo = [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 0, 1, 0],
          [0, 0, 1, 1, 0],
          [0, 0, 1, 0, 0],
        ];

        expect(secondGeneration).toEqual(gliderPatternOne);
        expect(thirdGeneration).toEqual(gliderPatternTwo);
      });
    });
  });
  describe('makeCellAlive', () => {
    it('Should not activate cell without player', () => {
      const c = new Conway(1);
      c.makeCellAlive(0, 0, 'Not exists');

      expect(c.getCell(0, 0).live).toBeFalsy();
    });
    it('Should not activate cell when position exceeds boarder', () => {
      const c = new Conway(1);
      const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
      c.makeCellAlive(5, 5, p.id);

      expect(c.getCell(0, 0).live).toBeFalsy();
    });
    it('Should activate cell', () => {
      const c = new Conway(1);
      const p = { id: '1234', ip: '1.1.1.1', color: '#112233' };
      c.addPlayer(p);
      c.makeCellAlive(0, 0, p.id);

      expect(c.getCell(0, 0).live).toBeTruthy();
    });
  });
});