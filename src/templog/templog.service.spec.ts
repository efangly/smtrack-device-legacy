import { Test, TestingModule } from '@nestjs/testing';
import { TemplogService } from './templog.service';

describe('TemplogService', () => {
  let service: TemplogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplogService],
    }).compile();

    service = module.get<TemplogService>(TemplogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
