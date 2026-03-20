import { BasePipePipe } from './base-pipe.pipe';

describe('BasePipePipe', () => {
    it('create an instance', () => {
        const pipe = new BasePipePipe();
        expect(pipe).toBeTruthy();
    });
});
