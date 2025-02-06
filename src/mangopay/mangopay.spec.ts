import { Test, TestingModule } from '@nestjs/testing';
import { Mangopay } from './mangopay';

describe('Mangopay', () => {
  let provider: Mangopay;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Mangopay],
    }).compile();

    provider = module.get<Mangopay>(Mangopay);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
