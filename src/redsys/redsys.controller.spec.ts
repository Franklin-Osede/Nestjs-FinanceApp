import { Test, TestingModule } from '@nestjs/testing';
import { RedsysController } from './redsys.controller';

describe('RedsysController', () => {
  let controller: RedsysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedsysController],
    }).compile();

    controller = module.get<RedsysController>(RedsysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
