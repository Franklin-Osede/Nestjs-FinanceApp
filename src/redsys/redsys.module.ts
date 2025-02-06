import { Module } from '@nestjs/common';
import { RedsysController } from './redsys.controller';
import { RedsysService } from './redsys.service';
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [RedsysController],
  providers: [RedsysService]
})
export class RedsysModule {}
