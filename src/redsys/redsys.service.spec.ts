import { Test, TestingModule } from '@nestjs/testing';
import { RedsysService } from './redsys.service';

describe('RedsysService', () => {
  let service: RedsysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedsysService],
    }).compile();

    service = module.get<RedsysService>(RedsysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
