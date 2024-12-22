import { Test, TestingModule } from '@nestjs/testing';
import { TemplogController } from './templog.controller';
import { TemplogService } from './templog.service';

describe('TemplogController', () => {
  let controller: TemplogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplogController],
      providers: [TemplogService],
    }).compile();

    controller = module.get<TemplogController>(TemplogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
