import { Test, TestingModule } from '@nestjs/testing';
import { CreditcardController } from './creditcard.controller';
import { CreditcardService } from './creditcard.service';

describe('CreditcardController', () => {
  let controller: CreditcardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditcardController],
      providers: [CreditcardService],
    }).compile();

    controller = module.get<CreditcardController>(CreditcardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
